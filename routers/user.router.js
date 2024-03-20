// user.router.js
const express = require("express");
const { userModel } = require("../models/user.model.js");

const userRouter = express.Router();

// All users get by admin
userRouter.get("/all", async (req, res) => {
    try {
      const users = await userModel.find();
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
});


// Create a new user
userRouter.post("/add", async (req, res) => {
    try {
      const newUser = new userModel({
        name: req.body.name,
        email: req.body.email,
        factoryAccess: [{
            factoryId: Number(req.body.factoryAccess[0].factoryId), // Convert factoryId to a number
            accessGrantedByAdmin: false
        }
        ], // Initialize factory access to an empty array
      });
      await newUser.save();
      res.status(201).send(newUser);
    } catch (err) {
      console.log(err);
      res.status(500).send("Serve   r Error");
    }
  });


// Grant factory access to a user
userRouter.get("/", async (req, res) => {
    try {
      const users = await User.find().populate("factoryAccess");
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

userRouter.put("/:userId/factory-access/:factoryId", async (req, res) => {
    try {
      const { userId, factoryId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.factoryAccess.push(factoryId);
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = {
  userRouter,
};
