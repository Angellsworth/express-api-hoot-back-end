// Import mongoose so we can define our schema and model
const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    test: {
        type: String,
        required: true
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
},{ timestamps: true })


// Define the schema for a Hoot/Parent Schema(like a post or message)
const hootSchema = new mongoose.Schema(
  {
    // Title of the hoot - required string
    title: {
      type: String,
      required: true,
    },
    // Main content of the hoot - also required
    text: {
      type: String,
      required: true,
    },
    // Category must be one of the specified values
    category: {
      type: String,
      required: true,
      enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'], // restricts to these categories
    },
    // Reference to the User who authored the hoot
    // This allows us to "populate" user details later (like name or username)
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: [commentSchema] //embedded comment Schema
  },
  // Automatically adds createdAt and updatedAt timestamps
  { timestamps: true }
)

// Create the Hoot model using the schema
const Hoot = mongoose.model('Hoot', hootSchema)

// Export the model so we can use it in other files
module.exports = Hoot;