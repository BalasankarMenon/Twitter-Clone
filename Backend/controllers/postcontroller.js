import postModel from "../models/postmodel.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import User from "../models/usermodel.js";
import Notification from "../models/notificationmodel.js";

export async function createPost(req,res){
    
    try{
        const {text} = req.body;
        const {img} = req.body;
        const userId= req.user._id.toString();
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        if(!text && !img){
            return res.status(400).json({error:"Text and image are required to create a post"});
        }
        if(img){
            const uploadedimg = await cloudinary.uploader.upload(img);
            img = uploadedimg.secure_url;
        }
        const newPost = new postModel({
            user: userId,
            text,
            img,
        })
        await newPost.save();
        res.status(201).json(newPost);
    }catch(err){
        return res.status(500).json({error:"Server error"});

    }
}

export async function deletePost(req,res){
    try{
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        if(post.user.toString()!==req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete this post"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await postModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({message:"Post deleted successfully"});
    }catch(err){
        console.log("Error in deletePost controller:",err);
        return res.status(500).json({error:"Server error"});
    }
}

export async function commentPost(req,res){
    try{
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        const {text} = req.body;
        if(!text){
            return res.status(400).json({error:"Comment text is required"});
        }
        const userId = req.user._id;
        const newComment = {
            user: userId,
            text,
        };
        post.comments.push(newComment);
        await post.save();
        return res.status(200).json({message:"Comment added successfully",comment:newComment});

    }catch(err){
        console.log("Error in commentPost controller:",err);
        return res.status(500).json({error:"Server error"});
    }
}

export async function likeUnlikePost(req,res){
    try{
        const post = await postModel.findById(req.params.id);
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        if(post.likes.includes(userId)){
            post.likes.pull(userId);
            user.likedPosts.pull(post._id);
            await user.save();
            await post.save();
            const updatedLikes = post.likes.filter((id)=>{
                id.toString() !== userId.toString();
            })
            return res.status(200).json(updatedLikes);
        }
        else{
            post.likes.push(userId);
            user.likedPosts.push(post._id);
            await user.save();
            await post.save();
            
            const newNotification = new Notification({
                type:"like",
                from:userId,
                to:post.user,
                post:post._id,
            
            }); 
            await newNotification.save();
            const updatedLikes = post.likes;
            return res.status(200).json(updatedLikes);
        }
        
    }catch(err){
        console.log("Error in likeUnlikePost controller:",err);
        return res.status(500).json({error:"Server error"});
    }
}



export async function getallPosts(req,res){
    try{
        const posts = await postModel.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        if(posts.length===0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    }catch(err){
        console.log("Error in getallPosts controller:",err);
        return res.status(500).json({error:"Server error"});

    }
}


export async function getLikedPosts(req,res){
    const userId = req.user._id;
    
    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        const LikedPosts = await postModel.find({_id: {$in:user.likedPosts}}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        return res.status(200).json(LikedPosts);;
    }catch(err){
        console.log("Error in getLikedPosts controller:",err);
        return res.status(500).json({error:"Server error"});
    }
}



export async function getFollowingPosts(req,res){
    try{
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        const followingPosts = await postModel.find({user:{$in:user.following}}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        return res.status(200).json(followingPosts)

    }catch(err){
        console.log("Error in getFollowingPosts controller:",err);
        return res.status(500).json({error:"Server error"});
    }
}



export async function getUserPosts(req,res){
    try{
        const{username}= req.params;
        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({error:"User not found"});  
        }
        const userPosts = await postModel.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        return res.status(200).json(userPosts);
    }catch(err){
        console.log("Error in getUserPosts controller:",err);
        return res.status(500).json({error:"Server error"});    
    }
}



