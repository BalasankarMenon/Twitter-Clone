import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const Signup = async (req,res)=>{
    try{
        const{name,username,email,password}=req.body;
        const validemailFormat = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const validPasswordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!&*^%?$])[A-Za-z\d@#!&*^%?$]{8,}$/;
        if(!validemailFormat.test(email)){
            return res.status(400).json({error:"Invalid email format"})
        }
        if(!validPasswordFormat.test(password)){
            return res.status(400).json({error:"Password must be at least 8 characters long and include at least one lowercase letter, one number, and one special character."});
        }

        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error:"Username already taken"});
        }
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({error:"Email already exists"});
        }

        if(password.length <6){
            return res.status(400).json({error:"Password must be atleast 6 characters long "});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        })
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();
            res.status(201).json({
               _id:newUser._id,
                name:newUser.name,
                username:newUser.username,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,
            });
        }else{
            res.status(400).json({error:"Invalid user data"});
        }
      }catch(err){
        console.log("Error in signup controller",err.message);
        res.status(500).json({error:"Server error"});
    }
}
    

export const Login = async(req,res)=>{
   try{
    const{username,password}= req.body;
    const user = await User.findOne({username});
    if(!user){
        return res.status(400).json({error:"Username does not exist"});
    }

    const passwordMatch = user ? await bcrypt.compare(password,user.password) : false;
    if(passwordMatch === false){
        return res.status(400).json({error:"Incorrect password"});
    }

    if(user && passwordMatch){
        generateTokenAndSetCookie(user._id,res);
        res.status(200).json({
            _id:user._id,
            name:user.name,
            username:user.username,
            email:user.email,
            followers:user.followers,
            following: user.following,
            profileImg:user.profileImg,
            coverImg:user.coverImg,
        })
    }
   }catch(err){
    console.log("Something went wrong",err.message);
    return res.status(500).json({error:"Server error"})
   }
}

export const Logout = async(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    }catch(err){
        console.log("Error in Logout",err.message);
        return res.status(500).json({error:"Server error"});
    }
}

export async function getCurrentUser(req,res){
    try{
        const userId = await User.findById(req.user._id).select("-password");
        return res.status(200).json(userId);
    }catch(err){
        console.log("Error in getCurrentUser",err.message);
        return res.status(500).json({error:"Server error"});
    }
}