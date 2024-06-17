// user.router.js
const express = require("express");
const { userModel} = require("../models/user.model.js");
const jwt= require("jsonwebtoken");
const bcrypt = require('bcrypt');
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



userRouter.post("/user-access", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("Please provide name, email, and password");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists for this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find the user by email
    const user = await userModel.findOne({ email:email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, 'eliteMantra');

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// User updates their factory access
// userRouter.put("/update-access/:email", async (req, res) => {
//   try {
//     const { factoryId, accessGrantedByAdmin } = req.body.factories[0];
//     if (!factoryId || typeof accessGrantedByAdmin !== 'boolean') {
//       return res.status(400).send("Invalid request body");
//     }

//     const userEmail = req.params.email;

//     const user = await userModel.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     const factoryAccess = user.factoryAccess.find(f => f._id.toString() === factoryId);
//     if (!factoryAccess) {
//       return res.status(404).send("Factory access not found for this user");
//     }

//     factoryAccess.accessGrantedByAdmin = accessGrantedByAdmin;
//     await user.save();
//     res.status(200).send("Factory access updated successfully");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });


// user.router.js - All Request Endpoint

// userRouter.get("/all-request", async (req, res) => {
//   try {
//     const allrequest = await requestModel.find({status:"Pending"});
//     res.status(200).json(allrequest);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });


// user.router.js - Add Request Endpoint

// Function to send email
//  function sendEmail(to, link) {
//   const transporter = nodemailer.createTransport({
//     host: 'mail.smtp2go.com',
//     port: 587,
//     auth: {
//       email: 'vrtour@polycab.com',
//       pass: 'XwYDvZwwPx8W12Xo'
//     }
//   });

//   const mailOptions = {
//     from: 'vrtour@polycab.com',
//     to: to,
//     subject: 'Access Link',
//     text: `Use the following link to access the application: ${link}`
//   };

//   return transporter.sendMail(mailOptions);
// }

// // Use your Mailtrap credentials here
// const mailtrapUsername = 'ac714ee3ccba74';
// const mailtrapPassword = 'fff1d22fd78baf';


// userRouter.post("/request-access" ,async (req, res) => {
//   try {
//     const { firstName, lastName, email } = req.body;
//     if (!firstName || !lastName || !email) {
//       return res.status(400).send("Please provide first name, last name, and email");
//     }

//     const existingRequest = await requestModel.findOne({ email });
//     if (existingRequest) {
//       return res.status(400).send("Request already exists for this email");
//     }

//     // const link = generateLink(email);
//     // await sendEmail(email, link);

//     const newRequest = new requestModel({ firstName, lastName, email });
//     await newRequest.save();

//     res.status(201).json({ message: "Request submitted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });







// admin Approve and reject the request

// userRouter.put("/approve-access/:id", async (req, res) => {
//   try {
//     const requestId = req.params.id;
//     const { status } = req.body;

//     if (!status || !["Approved", "Rejected"].includes(status)) {
//       return res.status(400).send("Invalid status provided");
//     }

//     const request = await requestModel.findById(requestId);
//     if (!request) {
//       return res.status(404).send("Request not found");
//     }

//     request.status = status;
//     if (status === "Approved") {
//       request.unique_id = await generateUniqueID();
//       await request.save();
//       const link = generateLinkForUnique(request.email, request.unique_id);
//       await sendEmail(request.email, link);

//     }

//     res.status(200).send("Request status updated successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });

// verify uniquecode




module.exports = {
  userRouter,
};
