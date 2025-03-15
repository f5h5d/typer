const jwt = require('jsonwebtoken');

// Middleware to protect routes and extract user info from JWT
const authenticate = (req, res, next) => {
  const token = req.cookies.token;  // Get the token from the cookies

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify the token and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request object
    req.user = {
      email: decoded.email, 
      user_id: decoded.user_id, 
      username: decoded.username
    };

    next();  // Move to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = authenticate;