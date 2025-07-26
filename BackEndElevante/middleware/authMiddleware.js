import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Business from '../models/Business.js';
import mongoose from 'mongoose';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token not provided. Access denied.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: 'Token is missing user ID.' });
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    if (user.role !== 'admin' && user.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Account is not approved yet.',
        status: user.status,
        rejectionReason: user.rejectionReason || null
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Account is blocked.',
        reason: user.blockReason || 'Blocked by admin'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'This route is only for admins.' });
  }
  next();
};

const isAdmin = adminOnly;

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `This route is only for users with roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found.' });
      }
      if (
        !resource.userId.equals(req.user._id) &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'You are not authorized to access this resource.' });
      }
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };
};

const checkProjectOwnership = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid business id' });
  }
  try {
    const projectId = req.params.id;
    const project = await Business.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (
      !project.owner.equals(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }
    req.project = project;
    next();
  } catch (err) {
    console.error('checkProjectOwnership error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const isAdminOrEntrepreneur = (req, res, next) => {
  if (!req.user || !['admin', 'entrepreneur'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only admin or entrepreneur can create reports.' });
  }
  next();
};

export {
  protect,
  adminOnly,
  isAdmin,
  restrictTo,
  checkOwnership,
  checkProjectOwnership
};
