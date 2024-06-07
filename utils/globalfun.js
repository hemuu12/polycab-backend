const { requestModel } = require("../models/user.model");

 async function generateUniqueID() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
  
    let id;
    let isUnique = false;
  
    while (!isUnique) {
      id = Math.floor(Math.random() * (max - min + 1)) + min; // Generate random ID
  
      // Check if the generated ID already exists in the database
      const existingRequest = await requestModel.findOne({ unique_id: id });
  
      if (!existingRequest) {
        isUnique = true; // Set flag to exit the loop
      }
    }
  
    return id.toString(); // Convert ID to string
  }



  function generateLinkForUnique(email, uniqueCode) {
    return `http://localhost:3000/verify?email=${encodeURIComponent(email)}&uniqueCode=${encodeURIComponent(uniqueCode)}`;
  }

  module.exports={
    generateUniqueID,
    generateLinkForUnique
  }