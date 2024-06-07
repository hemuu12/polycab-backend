// user.router.js
const express = require("express");
const { userModel  , requestModel} = require("../models/user.model.js");
const nodemailer = require('nodemailer');
const jwt= require("jsonwebtoken");
const { generateUniqueID ,generateLinkForUnique } = require("../utils/globalfun.js");
const app = express();

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
    const allrequest = await requestModel.find({status:"Pending"});
    res.status(200).json(allrequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// user.router.js - Add Request Endpoint


function generateLink(email) {
  // two min
  const token = jwt.sign({ email, exp: Math.floor(Date.now() / 1000) + (10 * 60) }, 'hari');

  // 4 hours
  // const token = jwt.sign({ email, exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60) }, 'hari');
  return `http://localhost:3000/access?token=${token}`;
}

// Function to send email
 function sendEmail(to, link) {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'ac714ee3ccba74',
      pass: 'fff1d22fd78baf'
    }
  });

  const mailOptions = {
    from: 'harisingh.bisht@elitemantra.com',
    to: to,
    subject: 'Access Link',
    text: `Use the following link to access the application: ${link}`
  };

  return transporter.sendMail(mailOptions);
}

// Use your Mailtrap credentials here
const mailtrapUsername = 'ac714ee3ccba74';
const mailtrapPassword = 'fff1d22fd78baf';


userRouter.post("/request-access" ,async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).send("Please provide first name, last name, and email");
    }

    const existingRequest = await requestModel.findOne({ email });
    if (existingRequest) {
      return res.status(400).send("Request already exists for this email");
    }

    // const link = generateLink(email);
    // await sendEmail(email, link);

    const newRequest = new requestModel({ firstName, lastName, email });
    await newRequest.save();

    res.status(201).json({ message: "Request submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


userRouter.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    jwt.verify(token, 'hari', async (err, decoded) => {
      if (err) {

        return res.status(401).json({ message: "Token is invalid or expired" });
      } else {
        // JWT validates, return user data
        const user = await userModel.findOne({ email: decoded.email });
        return res.status(200).json({ user });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// function verifyToken(req, res, next) {
//   const token = req.query.token;
//   console.log(token);

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, 'hari');
//     req.user = decoded;
//     next();
//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       console.log(err);
//       return res.status(401).json({ message: "Token has expired" });
//     } else {
//       console.log(err);
//       return res.status(401).json({ error: "Invalid token" });
//     }
//   }
// }


// // Route to redirect to dashboard if token is valid
// userRouter.get('/verify', verifyToken, (req, res) => {
//   res.status(200).json({
//     message: 'Token is valid',
//     user: req.user,
//     redirectUrl: 'http://localhost:3000/dashboard'
//   });
// });




// admin Approve and reject the request

userRouter.put("/approve-access/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).send("Invalid status provided");
    }

    const request = await requestModel.findById(requestId);
    if (!request) {
      return res.status(404).send("Request not found");
    }

    request.status = status;
    if (status === "Approved") {
      request.unique_id = await generateUniqueID();
      await request.save();
      const link = generateLinkForUnique(request.email, request.unique_id);
      await sendEmail(request.email, link);

    }

    res.status(200).send("Request status updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// verify uniquecode

userRouter.post("/access-generate/:uniqueCode", async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;

    const request = await requestModel.findOne({ unique_id: uniqueCode });
    if (!request) {
      return res.status(404).json({ message: "Unique code not found" });
    }

    // Check if the request has already been used
    const existingUser = await userModel.findOne({ email: request.email });
    if (existingUser) {
      return res.status(400).json({ message: "Unique code already used" });
    }

    // Save the user to the user table
    const newUser = new userModel({
      name: `${request.firstName} ${request.lastName}`,
      email: request.email,
    });
    const savedUser = await newUser.save();

    // Create a JWT token with a 4-hour expiry using the saved user's ID
    const tokenData = {
      userId: savedUser._id,
      email: savedUser.email,
    };
    const token = jwt.sign(tokenData, 'hari', { expiresIn: '4h' });

    // Delete the request from the request table
    await requestModel.deleteOne({ unique_id: uniqueCode });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = {
  userRouter,
};
