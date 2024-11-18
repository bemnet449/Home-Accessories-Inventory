const express = require('express');
const sequelize = require('./config/database'); // Sequelize database setup
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const itemRoutes = require('./Routes/itemsroute'); // Import item routes
const Catag = require('./models/catag'); // Import Sequelize models
const Item = require('./models/items');
const History = require('./models/history');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

// Multer Storage Configuration for Category Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "__" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload Category Image POST Route
app.post("/uploadcatag", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required." });

  try {
    const newCatag = await Catag.create({ image: req.file.filename, name });
    res.json(newCatag);
  } catch (err) {
    console.error("Error saving to the database:", err);
    res.status(500).json({ error: "Failed to save category image to the database" });
  }
});

// Fetch all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Catag.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Delete Category by Name
app.delete('/deletecatag/:categoryName', async (req, res) => {
  const categoryName = req.params.categoryName;

  if (!categoryName) return res.status(400).json({ message: 'Category name is required' });

  try {
    const itemsInCategory = await Item.findAll({ where: { name: categoryName } });
    if (itemsInCategory.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category: items still exist in this category' });
    }

    const deletedCategory = await Catag.destroy({ where: { name: categoryName } });
    if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

// Save History
app.post("/savehistory", async (req, res) => {
  const { name, itemCode, datePurchased } = req.body;

  if (!name || !itemCode || !datePurchased) {
    return res.status(400).json({ error: "Name, item code, and date purchased are required." });
  }

  try {
    const newHistoryEntry = await History.create({ name, itemCode, datePurchased });
    res.status(201).json({ message: "History saved successfully!", data: newHistoryEntry });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Failed to save history." });
  }
});

// Fetch History
app.get("/gethistory", async (req, res) => {
  try {
    const historyRecords = await History.findAll();
    res.json(historyRecords);
  } catch (error) {
    console.error("Error fetching history records:", error);
    res.status(500).json({ error: "Failed to fetch history records." });
  }
});

// Attach other routes
app.use(itemRoutes);

// Start the Server
app.listen(3000, async () => {
  try {
    await sequelize.authenticate(); // Test database connection
    console.log("Connected to SQLite and Server is running on port 3000");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
