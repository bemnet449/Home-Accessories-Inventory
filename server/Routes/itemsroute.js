const express = require('express');
const multer = require("multer");
const path = require("path");
const ItemModel = require('../models/items'); // Ensure this path is correct for Sequelize

const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}__${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Multer Upload Setup
const upload = multer({ storage: storage });

// Upload Image Endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { itemCode, quantity, originalPrice, sellingPrice, name } = req.body;

  if (!itemCode || !quantity || !name) {
    return res.status(400).json({ error: "Item code, quantity, and name are required fields." });
  }

  const quantityNum = Number(quantity);
  const originalPriceNum = originalPrice ? Number(originalPrice) : null;
  const sellingPriceNum = sellingPrice ? Number(sellingPrice) : null;

  if (isNaN(quantityNum) || (originalPrice && isNaN(originalPriceNum)) || (sellingPrice && isNaN(sellingPriceNum))) {
    return res.status(400).json({ error: "Quantity, original price, and selling price must be valid numbers if provided." });
  }

  const typ = (originalPriceNum !== null && sellingPriceNum !== null) ? sellingPriceNum - originalPriceNum : 0;

  try {
    const newItem = await ItemModel.create({
      image: req.file.filename,
      itemCode,
      quantity: quantityNum,
      soldQuantity: 0,
      originalPrice: originalPriceNum,
      sellingPrice: sellingPriceNum,
      profit: 0,
      typ,
      name
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error saving to database:", err);
    res.status(500).json({ error: "Failed to save image to the database" });
  }
});

// Fetch items by category name
router.get("/getimg/:categoryName", async (req, res) => {
  const { categoryName } = req.params;

  if (!categoryName) {
    return res.status(400).json({ error: "Category name is required." });
  }

  try {
    const items = await ItemModel.findAll({
      where: { name: categoryName }
    });

    if (items.length === 0) {
      return res.status(404).json({ message: "No items found for this category." });
    }

    const formattedItems = items.map(item => ({
      id: item.id,
      itemCode: item.itemCode,
      quantity: item.quantity,
      soldQuantity: item.soldQuantity,
      profit: item.profit,
      typ: item.typ,
      images: [item.image]
    }));
    
    res.json(formattedItems);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items for the given category." });
  }
});

// Delete item by ID
router.delete('/deleteitem/:id', async (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  try {
    const deletedItem = await ItemModel.destroy({
      where: { id: itemId }
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
});

// Delete items by category name
// Delete items by category name
router.delete('/deleteitems/:categoryName', async (req, res) => {
  const categoryName = req.params.categoryName;

  if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
  }

  try {
      const deletedItems = await ItemModel.destroy({
          where: { name: categoryName }
      });

      if (deletedItems === 0) {
          return res.status(404).json({ message: 'No items found for the specified category' });
      }

      res.status(200).json({ message: 'Items in category deleted successfully' });
  } catch (error) {
      console.error('Error deleting items in category:', error);
      res.status(500).json({ message: 'Failed to delete items in category', error: error.message });
  }
});


// Update item by ID
router.put('/upload', async (req, res) => {
  const { id, itemCode, quantity, soldQuantity, profit } = req.body;

  try {
    const updatedItem = await ItemModel.update(
      { itemCode, quantity, soldQuantity, profit },
      { where: { id } }
    );

    if (updatedItem[0] === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch a single item by ID
router.get("/itemget/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const item = await ItemModel.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ message: "Failed to fetch item" });
  }
});

// Update item by ID
router.put("/edititem/:id", async (req, res) => {
  const { id } = req.params;
  const { itemCode, quantity, soldQuantity, profit, originalPrice, sellingPrice } = req.body;

  try {
    const updatedItem = await ItemModel.update(
      {
        itemCode,
        quantity,
        soldQuantity,
        profit,
        originalPrice,
        sellingPrice,
        typ: sellingPrice - originalPrice // Update `typ` based on new prices
      },
      { where: { id } }
    );

    if (updatedItem[0] === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
