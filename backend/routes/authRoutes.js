import express from 'express';
import { 
    signup, 
    login, 
    getProfile, 
    updateProfile, 
    deleteProfile,
    logout,
    getAllUsers,
    getUserByEmail // ✅ import this
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/UserSchema.js';


const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);
router.post('/logout', protect, logout);
router.get('/users', protect, getAllUsers);

// ✅ /users — dynamic handler
// If ?email exists → fetch a single user
// Else → fetch all users
router.get('/users', protect, (req, res, next) => {
    console.log(req.query.email)
    if (req.query.email) {
        return getUserByEmail(req, res, next);
    }
    return getAllUsers(req, res, next);
});

// Get user by email
router.get('/users/by-email', protect, async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
