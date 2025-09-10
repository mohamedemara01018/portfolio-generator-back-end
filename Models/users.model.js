import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    token: String,
    isVerified: Boolean,
    verificationCode: String,
    codeExpiresAt: String,
    portfolio: String
    //   [
    //     {
    //         type: {
    //             type: String, //
    //             required: true,
    //             unique: true,
    //         },
    //         content: [

    //         ]

    //     }
    // ]
}, { timestamps: true })


const userModel = mongoose.model('Users', userSchema);
export default userModel