import Notification from "../models/notificationmodel.js";
import User from "../models/usermodel.js";
import { v2 as cloudinary } from "cloudinary";


export async function getNotifications(req,res){
    try{
        const userId = req.user._id;
        const notifications = await Notification.find({to:userId}).populate({
            path:"from",
            select:"username profileImg",
        }).sort({createdAt:-1});

        await Notification.updateMany({to:userId},{read:true});
        return res.status(200).json(notifications);
    }catch(err){
        console.log("Error in getNotifications:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}


export async function deleteNotifications(req,res){
    try{
        const userId = req.user._id;
        await Notification.deleteMany({to:userId});
        return res.status(200).json({message:"All notifications deleted successfully"});
    }catch(err){
        console.log("Error in deleteNotifications:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}

export async function deleteNotification(req,res){
    try{
        const notificationId = req.params.id;
        const userId = req.user._id;
        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({error:"Notification not found"});
        }
        if(notification.to.toString()!== userId.toString()){
            return res.status(403).json({error:"Unauthorized to delete this notification"});
        }
        await Notification.findByIdAndDelete(notificationId);
        return res.status(200).json({message:"Notification deleted successfully"});
    }catch(err){
        console.log("Error in deleteNotification:",err.message);
        return res.status(500).json({error:"Server error"});
    }
}