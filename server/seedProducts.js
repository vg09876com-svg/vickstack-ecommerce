const mongoose = require("mongoose");
const dns = require("dns");

require("dotenv").config();

// Use Google DNS, just like server.js
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Product = require("./models/Product");

const products = [
  {
    name: "Classic Wristwatch",
    description: "A stylish watch for everyday wear.",
    price: 20000,
    originalPrice: 25000,
    stock: 12,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    ],
  },
  {
    name: "Women's Handbag",
    description: "A fashionable handbag for your essentials.",
    price: 18000,
    stock: 8,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  },
  {
    name: "Classic Sneakers",
    description: "Comfortable sneakers for everyday adventures.",
    price: 35000,
    originalPrice: 42000,
    stock: 15,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  },
  {
    name: "Men's Casual T-Shirt",
    description: "A comfortable casual shirt for any occasion.",
    price: 12000,
    stock: 20,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    name: "Women's Sunglasses",
    description: "Modern sunglasses with a stylish finish.",
    price: 10000,
    stock: 8,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
  },
  {
    name: "Leather Backpack",
    description: "A practical backpack for work, school, and travel.",
    price: 28000,
    stock: 10,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  },
  {
    name: "Women's Heels",
    description: "Elegant heels for special occasions.",
    price: 24000,
    stock: 7,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
  },
  {
    name: "Men's Denim Jacket",
    description: "A timeless denim jacket for a modern look.",
    price: 32000,
    stock: 9,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
  },
  {
    name: "Luxury Perfume",
    description: "A beautiful fragrance for everyday confidence.",
    price: 22000,
    originalPrice: 27000,
    stock: 14,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601",
  },
  {
    name: "Sports Sneakers",
    description: "Lightweight sneakers designed for active lifestyles.",
    price: 40000,
    stock: 11,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
  },
  {
    name: "Women's Shoulder Bag",
    description: "A versatile shoulder bag for everyday use.",
    price: 26000,
    stock: 6,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  },
  {
    name: "Men's Wristwatch",
    description: "A sophisticated watch with a clean design.",
    price: 30000,
    stock: 5,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  },
  {
    name: "Women's Casual Dress",
    description: "A beautiful dress for casual outings.",
    price: 19000,
    stock: 13,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956",
  },
  {
    name: "Classic Leather Shoes",
    description: "Smart leather shoes for a polished appearance.",
    price: 38000,
    stock: 4,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4",
  },
  {
    name: "Fashion Makeup Set",
    description: "A collection of beauty essentials for your routine.",
    price: 16000,
    stock: 18,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
  },
  {
    name: "Casual Men's Shorts",
    description: "Comfortable shorts for relaxed everyday wear.",
    price: 14000,
    stock: 16,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
  },
  {
    name: "Wireless Headphones",
    description: "Enjoy clear sound and wireless listening.",
    price: 45000,
    originalPrice: 55000,
    stock: 20,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  },
  {
    name: "Smartphone",
    description: "A modern smartphone for work and entertainment.",
    price: 185000,
    stock: 10,
    category: "Phones & Tablets",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    name: "Laptop Computer",
    description: "A reliable laptop for productivity and creativity.",
    price: 650000,
    stock: 5,
    category: "Computers",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  },
  {
    name: "Digital Camera",
    description: "Capture beautiful photos and memorable moments.",
    price: 320000,
    stock: 4,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with powerful sound.",
    price: 35000,
    stock: 14,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
  },
  {
    name: "Smart Television",
    description: "Enjoy movies and entertainment on a large screen.",
    price: 420000,
    stock: 6,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
  },
  {
    name: "Gaming Controller",
    description: "A comfortable controller for gaming.",
    price: 48000,
    stock: 12,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48",
  },
  {
    name: "Wireless Mouse",
    description: "A convenient wireless mouse for your computer.",
    price: 12000,
    stock: 25,
    category: "Computers",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
  },
  {
    name: "Modern Table Lamp",
    description: "A beautiful lamp for your bedroom or office.",
    price: 18000,
    stock: 15,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
  },
  {
    name: "Comfortable Sofa",
    description: "A comfortable sofa for your living room.",
    price: 450000,
    stock: 3,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  },
  {
    name: "Luxury Bedding Set",
    description: "Soft and comfortable bedding for your bedroom.",
    price: 42000,
    stock: 11,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
  },
  {
    name: "Electric Kettle",
    description: "A practical electric kettle for your kitchen.",
    price: 25000,
    stock: 18,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1594213114663-d94db9b17157",
  },
  {
    name: "Men's Sportswear",
    description: "Comfortable clothing for training and exercise.",
    price: 27000,
    stock: 13,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
  },
  {
    name: "Yoga Mat",
    description: "A comfortable mat for yoga and home workouts.",
    price: 18000,
    stock: 16,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c0",
  },
  {
    name: "Running Shoes",
    description: "Lightweight shoes for running and exercise.",
    price: 52000,
    stock: 8,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
  },
  {
    name: "Fitness Dumbbells",
    description: "Strength training equipment for your workouts.",
    price: 30000,
    stock: 10,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
  },
  {
    name: "Skincare Products",
    description: "Everyday skincare essentials for your routine.",
    price: 24000,
    stock: 19,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
  },
  {
    name: "Makeup Brushes",
    description: "A set of brushes for applying makeup.",
    price: 9000,
    stock: 22,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
  },
  {
    name: "Men's Formal Shirt",
    description: "A smart shirt for work and formal occasions.",
    price: 22000,
    stock: 14,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
  },
  {
    name: "Women's Fashion Sneakers",
    description: "Trendy sneakers for a casual everyday look.",
    price: 33000,
    stock: 9,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3",
  },
  {
    name: "Travel Suitcase",
    description: "A spacious suitcase for your next trip.",
    price: 78000,
    stock: 6,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87",
  },
  {
    name: "Wireless Earbuds",
    description: "Compact wireless earbuds for music and calls.",
    price: 28000,
    originalPrice: 35000,
    stock: 17,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
  },
];

const seedProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const existingProduct = await Product.findOne({
        name: product.name,
      });

      if (existingProduct) {
        console.log(`Skipped existing product: ${product.name}`);
        skipped++;
        continue;
      }

      await Product.create(product);
      console.log(`Added: ${product.name}`);
      added++;
    }

    const total = await Product.countDocuments();

    console.log("\nProduct import completed!");
    console.log(`New products added: ${added}`);
    console.log(`Existing products skipped: ${skipped}`);
    console.log(`Total products in database: ${total}`);
  } catch (error) {
    console.error("Product import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
