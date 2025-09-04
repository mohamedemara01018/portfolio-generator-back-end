import express from "express";
import mongoose from "mongoose";
import userRouter from "./Routes/users.routes.js";
import process from 'process'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

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


app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});

