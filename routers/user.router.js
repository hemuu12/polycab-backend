// user.router.js
const express = require("express");
const { userModel  , requestModel} = require("../models/user.model.js");

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

    const userEmail = req.params.email;

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


// user.router.js - All Request Endpoint

userRouter.get("/all-request", async (req, res) => {
  try {
    const allrequest = await requestModel.find();
    res.status(200).json(allrequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// user.router.js - Add Request Endpoint

userRouter.post("/request-access", async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).send("Please provide first name, last name, and email");
    }

    const existingRequest = await requestModel.findOne({ email });
    if (existingRequest) {
      return res.status(400).send("Request already exists for this email");
    }

    const newRequest = new requestModel({ firstName, lastName, email });
    await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// admin Approve and reject the request

userRouter.put("/approve-access/:id", async (req, res) => {

  try{
    const requestId=req.params.id

    const { status }=req.body

    if(!status || !["Approved" ,"Rejected"].includes(status)){
        return  res.status(400).send("Invalid status Provided")
    }
    const request = await requestModel.findById(requestId);
      if (!request) {
        return res.status(404).send("Request not found");
      }

    request.status = status;
    await request.save();

    if (status === "Approved") {
      // Create a new user based on the request
      const newUser = new userModel({
        name: `${request.firstName} ${request.lastName}`,
        email: request.email,
      });
      await newUser.save();
      await requestModel.findByIdAndDelete(requestId); // Delete the request

    } else if (status === "Rejected") {
      await requestModel.findByIdAndDelete(requestId); // Delete the request
    }


    res.status(200).send("Request status updated successfully");
  }
  catch(error){
      console.error(err);
      res.status(500).send("Server Error");
  }


})


module.exports = {
  userRouter,
};
