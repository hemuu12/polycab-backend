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
// User updates their factory access
userRouter.put("/update-access/:email", async (req, res) => {
  try {
    const { factoryId, accessGrantedByAdmin } = req.body.factories[0];
    if (!factoryId || typeof accessGrantedByAdmin !== 'boolean') {
      return res.status(400).send("Invalid request body");
    }

    const userEmail = req.params.email; // Extract the email from route params

    const user = await userModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const factoryAccess = user.factoryAccess.find(f => f._id.toString() === factoryId);
    if (!factoryAccess) {
      return res.status(404).send("Factory access not found for this user");
    }

    factoryAccess.accessGrantedByAdmin = accessGrantedByAdmin;
    await user.save();
    res.status(200).send("Factory access updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



module.exports = {
  userRouter,
};
