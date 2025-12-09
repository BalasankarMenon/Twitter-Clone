import express from "express";
import path from "path"
import dotenv from "dotenv";
import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userroutes.js";
import { connectToDB } from "./database/db.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import postRoutes from "./routes/postroutes.js";
import notificationRoutes from "./routes/notificationroutes.js";
dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})
 

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/notifications",notificationRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/Frontend/dist")));

	app.get("/(.*)", (req, res) => {
		res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
	});
}

app.get("/",(req,res)=>{
    res.send("Server is ready");
})

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
    connectToDB();
})