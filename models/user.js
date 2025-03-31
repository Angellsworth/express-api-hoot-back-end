// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

  // Define a schema for the User model
  // Each user must have a username and a hashed password
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
});

  // Customize how the user data is converted to JSON
  // This runs when we send user data back to the client
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // Remove the hashed password so it doesn’t show up in API responses
    delete returnedObject.hashedPassword;
  }
});

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);