import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { createPost,deletePost,commentPost,likeUnlikePost, getallPosts,getLikedPosts,getFollowingPosts,getUserPosts} from "../controllers/postcontroller.js";
const router = express.Router();
router.get("/all",protectRoute,getallPosts);
router.get("/liked/:id",protectRoute,getLikedPosts);
router.get("/following",protectRoute,getFollowingPosts);
router.get("/user/:username",protectRoute,getUserPosts);
router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likeUnlikePost);
router.post("/comment/:id",protectRoute,commentPost);
router.delete("/:id",protectRoute,deletePost);

export default router;