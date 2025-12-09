 import mongoose from 'mongoose';

 const postschema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
    },
    img:{
        type:String,
    },
    likes:[
    {   
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        },
    ],
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            },
            text:{
                type:String,
                required:true
            },
        },
    ],

 },{timestamps:true});

 const postModel = mongoose.model("post",postschema);
 export default postModel;