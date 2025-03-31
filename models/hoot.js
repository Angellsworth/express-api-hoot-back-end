// Import mongoose to define schemas and models
const mongoose = require('mongoose')

// Define the Comment schema (used as a subdocument inside a Hoot)
const commentSchema = new mongoose.Schema({
  // The content of the comment — required
  text: {
    type: String,
    required: true
  },
  // Reference to the user who made the comment
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, 
// Automatically adds createdAt and updatedAt timestamps to each comment
{ timestamps: true })

// Define the main Hoot schema (like a social media post)
const hootSchema = new mongoose.Schema({
  // Title of the hoot — required
  title: {
    type: String,
    required: true,
  },
  // Body/content of the hoot — required
  text: {
    type: String,
    required: true,
  },
  // Category of the hoot — must be one of the listed options
  category: {
    type: String,
    required: true,
    enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'],
  },
  // Reference to the user who created the hoot
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Embedded array of comments — each follows the commentSchema
  comments: [commentSchema]
}, 
// Automatically adds createdAt and updatedAt timestamps to each hoot
{ timestamps: true })

// Create and export the Hoot model
const Hoot = mongoose.model('Hoot', hootSchema)
module.exports = Hoot;