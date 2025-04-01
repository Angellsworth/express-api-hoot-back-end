const express = require('express');
const verifyToken = require("../middleware/verify-token");
const Hoot = require('../models/hoot');
const router = express.Router();

// ********************************************
// POST /hoots - CREATE route (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Step 1: Attach the logged-in user's ID as the author of this hoot
    req.body.author = req.user._id;
    // Step 2: Create a new hoot using the request body
    const hoot = await Hoot.create(req.body);
    // Step 3: Add full user details to the response (for client display)
    hoot._doc.author = req.user;
    // Step 4: Send a 201 Created response with the new hoot
    res.status(201).json(hoot);
  } catch (error) {
    // Step 5: Catch any errors and return a 500 error
    console.log(error); // Remove this in production
    res.status(500).json({ error: error.message });
  }
});

// ********************************************
// GET ALL /hoots - READ all hoots (protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Step 1: Find all hoots in the database
    // Step 2: Populate the author field with full user data
    // Step 3: Sort the hoots from newest to oldest
    const hoots = await Hoot.find({})
      .populate('author')
      .sort({ createdAt: 'desc' });
    // Step 4: Send the hoots back as a JSON array
    res.status(200).json(hoots);
  } catch (error) {
    // Step 5: Handle any errors with a 500 status
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ********************************************
// GET ONE /hoots/:hootId - READ one hoot by ID (protected)
router.get('/:hootId', verifyToken, async (req, res) => {
  try {
    // Step 1: Find the hoot by its ID and populate the author
    const hoot = await Hoot.findById(req.params.hootId).populate([
      'author',
      'comments.author',
    ]);
    // Step 2: Send back the single hoot
    res.status(200).json(hoot);
  } catch (error) {
    // Step 3: Handle any errors with a 500 status
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ********************************************
// PUT /hoots/:hootId - UPDATE route (protected by token)
router.put('/:hootId', verifyToken, async (req, res) => {
  try {
    // Step 1: Find the hoot by its ID
    const hoot = await Hoot.findById(req.params.hootId);
    // Step 2: Check if the logged-in user is the author of this hoot
    // If not, block them from updating it
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    // Step 3: Perform the update and return the new version of the hoot
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      {
        new: true,           // Return the updated document, not the old one
        runValidators: true  // Make sure the update follows the schema rules
      }
    );
    // Step 4: Re-attach the user info to the response for clarity (optional)
    updatedHoot._doc.author = req.user;
    // Step 5: Send back the updated hoot as a response
    res.status(200).json(updatedHoot);
  } catch (error) {
    // Step 6: If something breaks, log the error and return a 500
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ********************************************
// DELETE /hoots/:hootId - DELETE route (protected by token)
router.delete('/:hootId', verifyToken, async (req, res) => {
    try {
      // Step 1: Find the hoot we want to delete by its ID
      const hoot = await Hoot.findById(req.params.hootId);
  
      // Step 2: Check if the person trying to delete the hoot is actually the one who created it
      if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You are not allowed to do that!");
      }
  
      // Step 3: If the user is the author, go ahead and delete the hoot
      const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
  
      // 👏 Let’s celebrate in the console!
      console.log("Angela! You Deleted this HOOT!", deletedHoot);
  
      // Step 4: Respond with the deleted hoot so the frontend knows what was removed
      res.status(200).json(deletedHoot);
    } catch (error) {
      // Step 5: Handle any errors with a 500 status
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });

// ********************************************
// POST Comments /hoots/:hootId/comments - CREATE route (protected by token)
router.post('/:hootId/comments', verifyToken, async (req, res) => {
    try {
      // Step 1: Attach the logged-in user's ID as the comment author
      req.body.author = req.user._id; 
      // Step 2: Find the parent hoot where the comment will be added
      const hoot = await Hoot.findById(req.params.hootId); 
      // Step 3: Push the new comment into the hoot's comments array
      hoot.comments.push(req.body); 
      // Step 4: Save the updated hoot with the new comment
      await hoot.save()
      // Step 5: Grab the newly added comment (it's the last one in the array)
      const newComment = hoot.comments[hoot.comments.length - 1];
      // Step 6: Attach full user info to the comment for the response
      newComment._doc.author = req.user;
      // Optional: Console celebration 🎉
      console.log("Angela! You added a new comment to this HOOT!");
      // Step 7: Send back the new comment
      res.status(201).json(newComment);   
    } catch (error) {
      // Step 8: Handle any errors gracefully
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });

// ********************************************
// PUT /hoots/:hootId/comments/:commentId - UPDATE a comment (protected)
router.put('/:hootId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);

    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this comment' });
    }

    comment.text = req.body.text;
    await hoot.save();

    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
// ********************************************
// DELETE /hoots/:hootId/comments/:commentId - DELETE a comment (protected)
router.delete('/:hootId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);

    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this comment' });
    }

    hoot.comments.remove({ _id: req.params.commentId });
    await hoot.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;