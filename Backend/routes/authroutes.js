import mongoose from "mongoose";
import express from "express";
import { getCurrentUser,Signup,Login,Logout } from "../controllers/authcontroller.js";
import { protectRoute } from "../middleware/protectroute.js";
const router = express.Router();

router.get("/me",protectRoute,getCurrentUser);
router.post("/signup",Signup)
router.post("/login",Login);
router.post("/logout",Logout);

export default router;