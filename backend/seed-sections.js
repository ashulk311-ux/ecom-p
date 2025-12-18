const mongoose = require('mongoose');
require('dotenv').config();

const ProductSection = require('./models/ProductSection');
const Grocery = require('./models/Grocery');

const seedSections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const sections = [
      {
        name: 'deal-of-day',
        displayName: 'Deal of the Day',
        icon: '🔥',
        description: 'Best deals available today',
        filterCriteria: {
          type: 'auto',
          minDiscount: 10,
          sortBy: 'discount',
          limit: 10
        },
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'cooking-essentials',
        displayName: 'Cooking Essentials',
        icon: '👨‍🍳',
        description: 'Everything you need for cooking',
        filterCriteria: {
          type: 'auto',
          category: 'Vegetables',
          sortBy: 'popular',
          limit: 10
        },
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'maximized-saving',
        displayName: 'Maximized Saving',
        icon: '💰',
        description: 'Maximum discounts and savings',
        filterCriteria: {
          type: 'auto',
          minDiscount: 20,
          sortBy: 'discount',
          limit: 10
        },
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'new-launches',
        displayName: 'New Launches',
        icon: '🆕',
        description: 'Recently added products',
        filterCriteria: {
          type: 'auto',
          sortBy: 'newest',
          limit: 10
        },
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'lowest-prices',
        displayName: 'Lowest Prices',
        icon: '💸',
        description: 'Products at the lowest prices',
        filterCriteria: {
          type: 'auto',
          sortBy: 'price',
          limit: 10
        },
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'grab-or-gone',
        displayName: 'Grab or Gone',
        icon: '⏰',
        description: 'Limited stock - grab them fast!',
        filterCriteria: {
          type: 'auto',
          sortBy: 'popular',
          limit: 10
        },
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'you-may-like',
        displayName: 'Grocery Items You May Like',
        icon: '💡',
        description: 'Based on your basket',
        filterCriteria: {
          type: 'dynamic'
        },
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'buy-again',
        displayName: 'Buy Again',
        icon: '🔄',
        description: 'Based on your past purchases',
        filterCriteria: {
          type: 'dynamic'
        },
        displayOrder: 8,
        isActive: true
      }
    ];

    for (const section of sections) {
      await ProductSection.findOneAndUpdate(
        { name: section.name },
        section,
        { upsert: true, new: true }
      );
    }

    console.log('Product sections seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sections:', error);
    process.exit(1);
  }
};

seedSections();

