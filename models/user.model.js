// user.model.js
const mongoose = require("mongoose");

function validateEmail(email) {
    // Use a regular expression to validate the email format
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
  }

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
      validate: [validateEmail, 'Please fill a valid email address'],
      match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    factoryAccess: [
        {
          factoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
          name: { type: String },
          accessGrantedByAdmin: { type: Boolean, default: false },
        },
    ]
  },
  { versionKey: false }
);

const userModel = mongoose.model("User", userSchema);


// request model

const requestSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  factoryAccess: [
    {
      factoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      name: { type: String },
      accessGrantedByAdmin: { type: Boolean, default: false },
    },
],
  unique_id: { type:String }
});

const requestModel = mongoose.model("Request", requestSchema);

module.exports = {
  userModel,
  requestModel
};