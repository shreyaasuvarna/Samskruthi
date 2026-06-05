import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    typeOfUser: {
        type: String,
        enum: ['Student', 'Teacher'],
        required: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    // Allow multiple connected teachers
    teachersConnected: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    studentsConnected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}]
,
    // For teachers: subjects they teach
    subjects: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// 🔒 Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔍 Validate that connected users are teachers
UserSchema.pre('save', async function (next) {
    if (this.teachersConnected && this.teachersConnected.length > 0) {
        const connectedUsers = await mongoose.model('User')
            .find({ _id: { $in: this.teachersConnected } });

        const nonTeachers = connectedUsers.filter(u => u.typeOfUser !== 'Teacher');

        if (nonTeachers.length > 0) {
            return next(new Error('All connected users must be Teachers.'));
        }
    }
    next();
});

// 🔑 Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
