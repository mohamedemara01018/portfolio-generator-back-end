import mongoose from "mongoose";
const { Schema } = mongoose;

const templatesSchema = new Schema({
    image: {
        type: String,
        required: true,
    },
    templateName: {
        type: String,
        required: true,
        enum: ["modern", "minimal", "classic"], // لو عندك كذا template
    },
    profile: {
        image: { type: String },
        bio: { type: String, required: true },
        aboutMe: { type: String, required: true },
    },
    skills: [
        {
            name: { type: String, required: true },
            level: { type: String }, // optional: beginner, intermediate, advanced
        },
    ],
    projects: [
        {
            image: { type: String, required: true },
            title: { type: String, required: true },
            desc: { type: String, required: true },
            tools: [{ type: String }], // tech stack لكل project
        },
    ],
    certifications: [
        {
            title: { type: String, required: true },
            org: { type: String },
            date: { type: Date },
            credentialLink: { type: String },
        },
    ],
    freelancing: {
        services: [{ type: String }],
        testimonials: [
            {
                clientName: String,
                feedback: String,
            },
        ],
    },
    blog: [
        {
            title: { type: String, required: true },
            slug: { type: String, unique: true },
            content: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
    contact: {
        email: { type: String },
        phone: { type: String },
        social: {
            linkedin: String,
            github: String,
            twitter: String,
        },
    },
});

export default mongoose.model("Template", templatesSchema);
