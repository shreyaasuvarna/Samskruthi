import express from "express"
import dotenv from 'dotenv'
import UserRoutes from './routes/authRoutes.js'
import User from './models/UserSchema.js'
import DoubtRoutes from './routes/doubtRoutes.js'
import ChatRoutes from './routes/chatRoutes.js'
import dbconnection from "./database/connection.js"
import cors from 'cors'
import ChatbotRoutes from './routes/chatbotRoutes.js';

// Load environment variables
dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors())
// Simple request logger to aid debugging (prints method, path and query)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

// Compatibility endpoint: accept legacy frontend calls to /api/users
// Supports: GET /api/users -> list users, GET /api/users?email=... -> single user
app.get('/api/users', async (req, res) => {
    try {
        const { email } = req.query;
        if (email) {
            const user = await User.findOne({ email }).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json(user);
        }
        const users = await User.find({}).select('-password');
        return res.status(200).json(users);
    } catch (err) {
        console.error('Error in /api/users compatibility handler', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
app.use('/user',UserRoutes)
// mount doubt routes under /api/doubts to match frontend
app.use('/api/doubts', DoubtRoutes)
// mount chat routes
app.use('/api/chats', ChatRoutes)

app.use('/api/chatbot', ChatbotRoutes);
