const mongoose = require('mongoose');
require('dotenv').config();

const Grocery = require('./models/Grocery');

// Product images mapping - using Unsplash and other free image sources
const productImages = {
  'Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&h=500&fit=crop',
  'Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop',
  'Eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop',
  'Tomatoes': 'https://images.unsplash.com/photo-1546099665-68d4c2e8b5e1?w=500&h=500&fit=crop',
  'Onions': 'https://images.unsplash.com/photo-1618512496249-0e3c8a2e0c5a?w=500&h=500&fit=crop',
  'Potatoes': 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=500&h=500&fit=crop',
  'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop',
  'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b27c5a?w=500&h=500&fit=crop',
  'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=500&fit=crop',
  'Yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop',
  'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop',
  'Butter': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&h=500&fit=crop',
  'Orange Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop',
  'Coffee': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop'
};

// Category-based fallback images
const categoryImages = {
  'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop',
  'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop',
  'Vegetables': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=500&fit=crop',
  'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&h=500&fit=crop',
  'Meat': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=500&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1556679343-c7306c197cbc?w=500&h=500&fit=crop'
};

const seedImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const groceries = await Grocery.find({});
    console.log(`Found ${groceries.length} products to update`);

    let updated = 0;
    let skipped = 0;

    for (const grocery of groceries) {
      // Skip if image already exists
      if (grocery.image && grocery.image.trim() !== '') {
        skipped++;
        continue;
      }

      // Get image URL based on product name or category
      let imageUrl = productImages[grocery.name];
      
      if (!imageUrl) {
        // Use category-based image as fallback
        imageUrl = categoryImages[grocery.category] || 
          'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=500&fit=crop'; // Generic grocery image
      }

      grocery.image = imageUrl;
      await grocery.save();
      updated++;
      console.log(`✓ Updated ${grocery.name} with image`);
    }

    console.log(`\n✅ Image seeding complete!`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products (already had images)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding images:', error);
    process.exit(1);
  }
};

seedImages();

