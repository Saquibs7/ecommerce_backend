import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { ErrorMiddleware } from "./middlewares/error.js";
import authRoutes from "./routes/authRoute.js";
import uploadRoutes from "./routes/upload.route.js"

export const app=express();
app.use(morgan('dev'));
// Security middleware
app.use(helmet());
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","DELETE","PUT","PATCH"],
    Credentials:true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use("/api/auth", authRoutes);
app.use('/api/upload', uploadRoutes);
app.use(ErrorMiddleware)