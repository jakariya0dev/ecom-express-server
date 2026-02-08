import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    avatar: {
        type: String,
        default: null,
    },
    mobile: {
        type: String,
        default: null,
        index: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
    verified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;