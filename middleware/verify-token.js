// Bring in the jsonwebtoken library so we can verify JWTs (JSON Web Tokens)
const jwt = require('jsonwebtoken');

    // This is our middleware function that protects certain routes
    // It checks to see if a valid token is included in the request
function verifyToken(req, res, next) {
  try {
      // Look for the token in the Authorization header of the request
      // The format is usually: "Bearer <token>"
      // We split it by the space and grab just the token part
    const token = req.headers.authorization.split(' ')[1];

      // Use our secret key (stored in environment variables) to verify the token
      // If the token is valid and hasn't expired, this will decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add the decoded payload from the token to the request object
      // This way, other parts of the app can know who the user is (like req.user._id)
    req.user = decoded.payload;

      // Everything checks out! Pass control to the next function (usually the route handler)
      next();
  } catch (err) {
      // If something goes wrong (no token, bad token, expired, etc), send back a 401 error
      // 401 means "unauthorized" — the user is not allowed to access this route
    res.status(401).json({ err: 'Invalid token.' });
  }
}

  // Export this function so we can use it to protect routes throughout our app
module.exports = verifyToken;