const express = require('express');
const ProductSection = require('../models/ProductSection');
const Grocery = require('../models/Grocery');
const Order = require('../models/Order');
const { adminAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Get all active sections with products
router.get('/sections', async (req, res) => {
  try {
    const sections = await ProductSection.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .populate('productIds');

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        let products = [];

        if (section.filterCriteria.type === 'manual' && section.productIds.length > 0) {
          // Manual selection - use productIds
          products = section.productIds.filter(p => p && p.stock > 0).slice(0, 10);
        } else if (section.filterCriteria.type === 'auto') {
          // Auto filter based on criteria
          const query = { stock: { $gt: 0 }, isAvailable: true };
          
          if (section.filterCriteria.category) {
            query.category = section.filterCriteria.category;
          }
          // Only filter by discount if products actually have discounts
          // Otherwise, show products sorted by discount (which will be 0, but still show them)
          if (section.filterCriteria.minDiscount) {
            // Check if any products have discounts first
            const hasDiscounts = await Grocery.findOne({ 
              discount: { $gte: section.filterCriteria.minDiscount },
              stock: { $gt: 0 }
            });
            if (hasDiscounts) {
              query.discount = { $gte: section.filterCriteria.minDiscount };
            }
            // If no products have discounts, don't filter by discount - show all products
          }
          if (section.filterCriteria.maxPrice) {
            query.price = { $lte: section.filterCriteria.maxPrice };
          }
          if (section.filterCriteria.minRating) {
            query.rating = { $gte: section.filterCriteria.minRating };
          }

          let sortQuery = {};
          switch (section.filterCriteria.sortBy) {
            case 'price':
              sortQuery = { price: 1 };
              break;
            case 'rating':
              sortQuery = { rating: -1 };
              break;
            case 'discount':
              // Sort by discount descending, but include products with 0 discount
              sortQuery = { discount: -1, price: 1 };
              break;
            case 'newest':
              sortQuery = { createdAt: -1 };
              break;
            case 'popular':
              // Sort by stock (higher stock = more popular) or rating
              sortQuery = { stock: -1, rating: -1 };
              break;
            default:
              sortQuery = { price: 1 };
          }

          products = await Grocery.find(query)
            .sort(sortQuery)
            .limit(section.filterCriteria.limit || 10);
        } else if (section.filterCriteria.type === 'dynamic') {
          // Dynamic sections (you-may-like, buy-again)
          // These will be populated by user-specific route, but show fallback products here
          // The user-specific route will override this
          products = await Grocery.find({ stock: { $gt: 0 }, isAvailable: true })
            .sort({ rating: -1, stock: -1 })
            .limit(10);
        }

        return {
          _id: section._id,
          name: section.name,
          displayName: section.displayName,
          icon: section.icon,
          description: section.description,
          products: products,
          isActive: section.isActive,
          displayOrder: section.displayOrder
        };
      })
    );

    // Return all sections, even if they have no products (frontend will handle hiding empty ones)
    // But prioritize sections with products first
    const sectionsWithProductsList = sectionsWithProducts.filter(s => s.products.length > 0);
    const sectionsWithoutProducts = sectionsWithProducts.filter(s => s.products.length === 0);
    
    // Return sections with products first, then sections without products
    res.json([...sectionsWithProductsList, ...sectionsWithoutProducts]);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user-specific sections (you-may-like, buy-again)
router.get('/sections/user', async (req, res) => {
  try {
    // Try to get user from token, but don't require it
    let userId = null;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        if (user) userId = user._id;
      }
    } catch (e) {
      // Not authenticated, continue without user
    }
    
    // Get user's past orders (if authenticated)
    let userOrders = [];
    let purchasedProductIds = [];
    
    if (userId) {
      userOrders = await Order.find({ 
        userId: userId,
        moduleType: 'grocery',
        status: 'delivered'
      }).populate('items.itemId');

      // Extract product IDs from orders
      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.itemId && !purchasedProductIds.includes(item.itemId._id)) {
            purchasedProductIds.push(item.itemId._id);
          }
        });
      });
    }

    // Get current cart items for "you-may-like"
    const cartItems = req.query.cartItems ? JSON.parse(req.query.cartItems) : [];
    const cartProductIds = cartItems.map(item => item.itemId);

    const sections = await ProductSection.find({ 
      isActive: true,
      name: { $in: ['you-may-like', 'buy-again'] }
    }).sort({ displayOrder: 1 });

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        let products = [];

        if (section.name === 'buy-again' && purchasedProductIds.length > 0) {
          products = await Grocery.find({
            _id: { $in: purchasedProductIds },
            stock: { $gt: 0 },
            isAvailable: true
          }).limit(10);
        } else if (section.name === 'you-may-like' && cartProductIds.length > 0) {
          // Get products from same categories as cart items
          const cartProducts = await Grocery.find({ _id: { $in: cartProductIds } });
          const categories = [...new Set(cartProducts.map(p => p.category))];
          
          products = await Grocery.find({
            category: { $in: categories },
            _id: { $nin: cartProductIds },
            stock: { $gt: 0 },
            isAvailable: true
          }).limit(10);
        }

        return {
          _id: section._id,
          name: section.name,
          displayName: section.displayName,
          icon: section.icon,
          description: section.description,
          products: products,
          isActive: section.isActive,
          displayOrder: section.displayOrder
        };
      })
    );

    res.json(sectionsWithProducts.filter(s => s.products.length > 0));
  } catch (error) {
    console.error('Error fetching user sections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all sections
router.get('/admin/sections', adminAuth, async (req, res) => {
  try {
    const sections = await ProductSection.find().sort({ displayOrder: 1 });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create section
router.post('/admin/sections', adminAuth, async (req, res) => {
  try {
    const section = new ProductSection(req.body);
    await section.save();
    res.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update section
router.put('/admin/sections/:id', adminAuth, async (req, res) => {
  try {
    const section = await ProductSection.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete section
router.delete('/admin/sections/:id', adminAuth, async (req, res) => {
  try {
    await ProductSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update section products
router.put('/admin/sections/:id/products', adminAuth, async (req, res) => {
  try {
    const { productIds } = req.body;
    const section = await ProductSection.findByIdAndUpdate(
      req.params.id,
      { productIds, updatedAt: new Date() },
      { new: true }
    ).populate('productIds');
    res.json(section);
  } catch (error) {
    console.error('Error updating section products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

