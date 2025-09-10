import express from "express";
import mongoose from "mongoose";
import userRouter from "./Routes/users.routes.js";
import templateRouter from "./Routes/templates.routes.js"
import process from 'process'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express();

app.use(cookieParser())
app.use(express.json());
dotenv.config();
app.use(cors({
    origin: "http://localhost:3000", // your frontend url
    credentials: true, // allow cookies
}));


const mongoURL = process.env.MONGO_URI
const port = process.env.PORT

mongoose
    .connect(mongoURL)
    .then(() => {
        console.log("the connection with database successfully");
    })
    .catch((err) => {
        console.error("something went wrong when connecting with database", err);
    });

export const transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    }
)

app.use("/users", userRouter);
app.use("/templates", templateRouter);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});

