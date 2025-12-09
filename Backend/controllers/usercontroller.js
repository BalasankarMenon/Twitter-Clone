import User from "../models/usermodel.js";
import Notification from "../models/notificationmodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from "cloudinary";

export async function getUserProfile(req,res){
    const {username} = req.params;
    try{
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({error:"User not found"});

        }
        res.status(200).json(user);
    }catch(err){
        console.log("Something went wrong:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}

export async function followUnfollowUser(req,res){
    try{
    const userIdtofollow = req.params.id;
    const userTomodify = await User.findById(userIdtofollow);
    const currentUser = await User.findById(req.user._id);

    if(userIdtofollow === req.user._id){
        return res.status(400).json({error:"You cannot follow yourself"});
    }
    if(!userTomodify || !currentUser){
        return res.status(404).json({error:"User to follow not found"});
    }
    if(currentUser.following.includes(userIdtofollow)){
        currentUser.following.pull(userIdtofollow);
        userTomodify.followers.pull(req.user._id);
        await currentUser.save();
        await userTomodify.save();

        return res.status(200).json({message:"Unfollowed user successfully"});
    }else{
        currentUser.following.push(userIdtofollow);
        userTomodify.followers.push(req.user._id);
        await currentUser.save();
        await userTomodify.save();

        const newNotification = new Notification({
            type:"follow",
            from: req.user._id,
            to: userIdtofollow,

        });
        await newNotification.save();

        return res.status(200).json({message:"Followed user successfully" });
    }
    

    }catch(err){
        console.log("Error in followUnfollowUser:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}

//get suggested users to follow

export async function getSuggestedUsers(req,res){
    try{
        const userId = req.user._id;
        const currentUser = await User.findById(req.user._id);
        const followingIds = currentUser.following;
        
        const users = await User.aggregate([
            {$match:{
                _id:{$ne: userId}
            }
        },
        {$sample:{size:10}},  
        ])

        const filteredUsers = users.filter(user=>!followingIds.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,5);
        suggestedUsers.forEach((user)=>{
            (user.password = null);
        })
        return res.status(200).json(suggestedUsers);
    }catch(err){
        console.log("Error in getSuggestedUsers:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}

export async function updateUserProfile(req,res){
    const{name,email,username,currentPassword,newPassword,bio,link}= req.body;
    let {profileImg,coverImg} = req.body;
    const userId = req.user._id;
    try{
       let user = await User.findById(userId);
       if(!user){
        return res.status(404).json({error:"User not found"});
       }
       if((!newPassword && currentPassword)|| (newPassword && !currentPassword )){
        return res.status(400).json({error:"Both current and new passwords are required to change passowrd"});
       }
       if(newPassword && currentPassword){
        const isMatch = await bcrypt.compare(currentPassword,user.password);
        if(!isMatch){
            return res.status(400).json({error:"Current Password is incorrect"});
        }
        if(newPassword === currentPassword){
            return res.status(400).json({error:"New password cannot be same as current password"});
        }
        if(newPassword.length <6){
            return res.status(400).json({error:"New password must be at least 6 characters long"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword,salt);
        user.password = hashedPassword;
       }
       if(profileImg){
        if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        }
            const uploadedImg = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedImg.secure_url;
       }
       if(coverImg){
        if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        }
            const uploadedImg = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedImg.secure_url;
       }
        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;
        return res.status(200).json({user});

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Server error"});
    }

}