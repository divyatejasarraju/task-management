import jwt from 'jsonwebtoken';
import User from '../routes/users/model.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const admin = (req, res, next) => {
  // Check if user exists and has the required role
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Not authenticated',
      error: 'You need to be logged in to perform this action' 
    });
  }
  
  if (req.user.role === 'admin' || req.user.role === 'validator') {
    next(); // User has permission, proceed to the route handler
  } else {
    res.status(403).json({ 
      message: 'Permission denied', 
      error: 'Only administrators and validators can delete tasks' 
    });
  }
};


export { protect, admin };

