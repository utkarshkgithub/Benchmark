import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        accountType: {
            type: String,
            required: true,
            enum: ["Admin", "Student", "Instructor"],
        },
        active: {
            type: Boolean,
            default: false,
        },
        approved: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
            required: true,
        },
        token: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        isActiveToken: {
            type: Boolean,
            default: false,
        },
        activeToken: {
            token: String,
            expiresAt: Date,
        },
        activePasswordExpires: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
export default User;
