const express = require('express');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { itemId, itemType, name, image, price } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(
      item => item.itemId.toString() === itemId && item.itemType === itemType
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    wishlist.items.push({
      itemId,
      itemType,
      name,
      image,
      price
    });

    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item.itemId.toString() !== req.params.itemId
    );

    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/clear', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



