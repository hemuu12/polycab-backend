const express = require("express");
const multer = require("multer");
const { itemModel } = require("../models/post.model.js");

const itemRouter = express.Router();
const upload = multer(); // Initialize multer

// Get all items
itemRouter.get("/", async (req, res) => {
  try {
    const items = await itemModel.find();
    res.send(items);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Get item by ID
itemRouter.get("/:id", async (req, res) => {
  try {
    const item = await itemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.send(item);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});
// Create a new item
itemRouter.post("/add", upload.single('featuredImage'), async (req, res) => {
    try {
        const locationString = req.body.location;
        const lat = locationString ? parseFloat(locationString.split(',')[0]) : null;
        const long = locationString ? parseFloat(locationString.split(',')[1]) : null;

        if (isNaN(lat) || isNaN(long)) {
          res.status(400).send("Invalid location format");
          return;
        }
      const newItem = new itemModel({
        uniqueId: req.body.uniqueId,
        shortVideo: req.body.shortVideo,
        tourLink: req.body.tourLink,
        description: req.body.description,
        location: {
          "latitude":lat,
          "longitude":long,
        },
      });
      if (req.file && req.file.buffer) {
        newItem.featuredImage = req.file.buffer;
      }
      await newItem.save();
      res.status(201).send(newItem);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  });

// Update item by ID
itemRouter.put("/update/:id", upload.single('featuredImage'), async (req, res) => {
  try {
    // Find the item by uniqueId
    const item = await itemModel.findOne({ uniqueId: req.params.id });

    // Check if a new featuredImage is uploaded
    if (req.file) {
      // If a new featuredImage is uploaded, update the featuredImage field
      req.body.featuredImage = req.file.buffer;

      // Delete the previous featuredImage if it exists
      if (item.featuredImage) {
        // Perform deletion of previous featuredImage
        // For example, if it's stored in the database as a Buffer
        // You may need to adjust this based on how your images are stored
        item.featuredImage = undefined;
        await item.save();
      }
    } else {
      // If no new featuredImage is uploaded, keep the previous featuredImage
      req.body.featuredImage = item.featuredImage;
    }

    if (req.body.location) {
      const [latitude, longitude] = req.body.location.split(",").map(Number);

      // Update the req.body object with the new location object
      req.body.location = {
        latitude,
        longitude
      };
    }

    // Update the item with the new data (including the possibly updated featuredImage)
    const updatedItem = await itemModel.findOneAndUpdate(
      { uniqueId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).send("Item not found");
    }

    res.send(updatedItem);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});





// Delete item by ID
itemRouter.delete("/delete/:id", async (req, res) => {
  try {
    const item = await itemModel.findOneAndDelete({ uniqueId: req.params.id });
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.send("Item deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

module.exports = {
  itemRouter,
};
