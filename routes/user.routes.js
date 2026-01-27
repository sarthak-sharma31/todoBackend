import { Router } from "express";
import { registerUser, loginUser, getUser } from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/user', authMiddleware, getUser)

export default router;