import User from '../models/UserSchema.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    try {
        const { name, email, password, gender, typeOfUser, subjects } = req.body;

        // Validate input
        if (!name || !email || !password || !typeOfUser) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: name, email, password, typeOfUser"
            });
        }

        // Validate typeOfUser
        if (!['Student', 'Teacher'].includes(typeOfUser)) {
            return res.status(400).json({ success: false, message: 'typeOfUser must be either "Student" or "Teacher"' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            gender,
            typeOfUser,
            ...(typeOfUser === 'Teacher' && { subjects })
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    gender: user.gender,
                    typeOfUser: user.typeOfUser,
                    subjects: user.subjects || [],
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        // If Mongoose validation error, return details
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message).join('; ');
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                typeOfUser: user.typeOfUser,
                subjects: user.subjects || [],
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields
        user.name = req.body.name || user.name;
        user.gender = req.body.gender || user.gender;
        // Update subjects (for teachers)
        if (Array.isArray(req.body.subjects) && user.typeOfUser === 'Teacher') {
            user.subjects = req.body.subjects.map(s => String(s).trim()).filter(Boolean);
        }
        
        // Update email if provided and different
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
            user.email = req.body.email;
        }

        // Update password if provided
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                gender: updatedUser.gender,
                subjects: updatedUser.subjects
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // Since JWT is stateless, logout is handled on client side by removing token
        // This endpoint can be used for logging or additional logout logic
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users (Admin only - example)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get user by email (used for fetching teacher/student data)
// @route   GET /api/auth/users?email=example@gmail.com
// @access  Private
// Get user by email — used by chat creation
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email query required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

