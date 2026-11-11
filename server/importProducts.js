
const mongoose = require("mongoose");
const dns = require("dns");

require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Product = require("./models/Product");

const products = [
  {
    name: "Classic Wristwatch",
    price: 20000,
    originalPrice: 25000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    ],
    category: "Accessories",
    description: "A stylish watch for everyday wear.",
  },
  {
    name: "Women's Handbag",
    price: 18000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
    category: "Bags",
    description: "A fashionable handbag for your essentials.",
  },
  {
    name: "Classic Sneakers",
    price: 35000,
    originalPrice: 42000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Footwear",
    description: "Comfortable sneakers for everyday adventures.",
  },
  {
    name: "Men's Casual T-Shirt",
    price: 12000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    category: "Clothing",
    description: "A comfortable casual shirt for any occasion.",
  },
  {
    name: "Women's Sunglasses",
    price: 10000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    category: "Accessories",
    description: "Modern sunglasses with a stylish finish.",
  },
  {
    name: "Leather Backpack",
    price: 28000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    category: "Bags",
    description: "A practical backpack for work, school, and travel.",
  },
  {
    name: "Women's Heels",
    price: 24000,
    stock: 7,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
    category: "Footwear",
    description: "Elegant heels for special occasions.",
  },
  {
    name: "Men's Denim Jacket",
    price: 32000,
    stock: 9,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
    category: "Clothing",
    description: "A timeless denim jacket for a modern look.",
  },
  {
    name: "Luxury Perfume",
    price: 22000,
    originalPrice: 27000,
    stock: 14,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601",
    category: "Beauty",
    description: "A beautiful fragrance for everyday confidence.",
  },
  {
    name: "Sports Sneakers",
    price: 40000,
    stock: 11,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
    category: "Footwear",
    description: "Lightweight sneakers designed for active lifestyles.",
  },
  {
    name: "Women's Shoulder Bag",
    price: 26000,
    stock: 6,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
    category: "Bags",
    description: "A versatile shoulder bag for everyday use.",
  },
  {
    name: "Men's Wristwatch",
    price: 30000,
    stock: 5,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    category: "Accessories",
    description: "A sophisticated watch with a clean design.",
  },
  {
    name: "Women's Casual Dress",
    price: 19000,
    stock: 13,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956",
    category: "Clothing",
    description: "A beautiful dress for casual outings.",
  },
  {
    name: "Classic Leather Shoes",
    price: 38000,
    stock: 4,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4",
    category: "Footwear",
    description: "Smart leather shoes for a polished appearance.",
  },
  {
    name: "Fashion Makeup Set",
    price: 16000,
    stock: 18,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    category: "Beauty",
    description: "A collection of beauty essentials for your routine.",
  },
  {
    name: "Casual Men's Shorts",
    price: 14000,
    stock: 16,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
    category: "Clothing",
    description: "Comfortable shorts for relaxed everyday wear.",
  },
  {
    name: "Wireless Headphones",
    price: 45000,
    originalPrice: 55000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Electronics",
    description: "Enjoy clear sound and wireless listening.",
  },
  {
    name: "Smartphone",
    price: 185000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    category: "Phones & Tablets",
    description: "A modern smartphone for work and entertainment.",
  },
  {
    name: "Laptop Computer",
    price: 650000,
    stock: 5,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    category: "Computers",
    description: "A reliable laptop for productivity and creativity.",
  },
  {
    name: "Digital Camera",
    price: 320000,
    stock: 4,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    category: "Electronics",
    description: "Capture beautiful photos and memorable moments.",
  },
  {
    name: "Bluetooth Speaker",
    price: 35000,
    stock: 14,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    category: "Electronics",
    description: "Portable speaker with powerful sound.",
  },
  {
    name: "Smart Television",
    price: 420000,
    stock: 6,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    category: "Electronics",
    description: "Enjoy movies and entertainment on a large screen.",
  },
  {
    name: "Gaming Controller",
    price: 48000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48",
    category: "Electronics",
    description: "A comfortable controller for gaming.",
  },
  {
    name: "Wireless Mouse",
    price: 12000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    category: "Computers",
    description: "A convenient wireless mouse for your computer.",
  },
  {
    name: "Modern Table Lamp",
    price: 18000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    category: "Home & Living",
    description: "A beautiful lamp for your bedroom or office.",
  },
  {
    name: "Comfortable Sofa",
    price: 450000,
    stock: 3,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    category: "Home & Living",
    description: "A comfortable sofa for your living room.",
  },
  {
    name: "Modern Office Chair",
    price: 95000,
    stock: 7,
    image: "https://images.unsplash.com/photo-1505843490701-5be5d1b7e2f3",
    category: "Home & Living",
    description: "A stylish chair for your home office.",
  },
  {
    name: "Kitchen Blender",
    price: 55000,
    stock: 9,
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b",
    category: "Home & Living",
    description: "A useful kitchen appliance for everyday cooking.",
  },
  {
    name: "Luxury Bedding Set",
    price: 42000,
    stock: 11,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
    category: "Home & Living",
    description: "Soft and comfortable bedding for your bedroom.",
  },
  {
    name: "Electric Kettle",
    price: 25000,
    stock: 18,
    image: "https://images.unsplash.com/photo-1594213114663-d94db9b17157",
    category: "Home & Living",
    description: "A practical electric kettle for your kitchen.",
  },
  {
    name: "Men's Sportswear",
    price: 27000,
    stock: 13,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    category: "Sports",
    description: "Comfortable clothing for training and exercise.",
  },
  {
    name: "Yoga Mat",
    price: 18000,
    stock: 16,
    image: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c0",
    category: "Sports",
    description: "A comfortable mat for yoga and home workouts.",
  },
  {
    name: "Running Shoes",
    price: 52000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    category: "Sports",
    description: "Lightweight shoes for running and exercise.",
  },
  {
    name: "Fitness Dumbbells",
    price: 30000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    category: "Sports",
    description: "Strength training equipment for your workouts.",
  },
  {
    name: "Skincare Products",
    price: 24000,
    stock: 19,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
    category: "Beauty",
    description: "Everyday skincare essentials for your routine.",
  },
  {
    name: "Makeup Brushes",
    price: 9000,
    stock: 22,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
    category: "Beauty",
    description: "A set of brushes for applying makeup.",
  },
  {
    name: "Men's Formal Shirt",
    price: 22000,
    stock: 14,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
    category: "Clothing",
    description: "A smart shirt for work and formal occasions.",
  },
  {
    name: "Women's Fashion Sneakers",
    price: 33000,
    stock: 9,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3",
    category: "Footwear",
    description: "Trendy sneakers for a casual everyday look.",
  },
  {
    name: "Travel Suitcase",
    price: 78000,
    stock: 6,
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87",
    category: "Bags",
    description: "A spacious suitcase for your next trip.",
  },
  {
    name: "Wireless Earbuds",
    price: 28000,
    originalPrice: 35000,
    stock: 17,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
    category: "Electronics",
    description: "Compact wireless earbuds for music and calls.",
  },
];

async function importProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const existingProducts = await Product.find(
      {},
      { name: 1 }
    );

    const existingNames = new Set(
      existingProducts.map((product) =>
        product.name.trim().toLowerCase()
      )
    );

    const newProducts = products.filter(
      (product) =>
        !existingNames.has(product.name.trim().toLowerCase())
    );

    if (newProducts.length === 0) {
      console.log("All products already exist. Nothing to import.");
      return;
    }

    const insertedProducts = await Product.insertMany(newProducts);

    console.log(`${insertedProducts.length} products imported successfully.`);
    console.log(`Total products in database: ${await Product.countDocuments()}`);
  } catch (error) {
    console.error("Product import failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

importProducts();
