import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";

export async function protectRoute(req,res,next){
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error:"Unauthorized access"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(!decoded){
            return res.status(401).json({error:"Unauthorized: Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
           return res.status(401).json({error:"Unauthorized: User not found"}); 
        }
        req.user = user;
        next();
    }catch(err){
        console.log("Error in protectRoute ",err.message);
        return res.status(500).json({error:"Server error"});
    }
}