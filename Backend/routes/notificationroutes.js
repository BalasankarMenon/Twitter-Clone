import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { getNotifications,deleteNotifications,deleteNotification } from "../controllers/notificationcontroller.js";
const router = express.Router();

router.get("/",protectRoute,getNotifications);
router.delete("/",protectRoute,deleteNotifications);
router.delete("/:id",protectRoute,deleteNotification);

export default router;