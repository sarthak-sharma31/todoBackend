import { Router } from "express";
import { registerUser, loginUser, getUser, createTeam, addUserToTeam, getTeamMembers } from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/user', authMiddleware, getUser);

router.post("/team", authMiddleware, createTeam);
router.post("/team/add-user", authMiddleware, addUserToTeam);
router.get("/team/members", authMiddleware, getTeamMembers);


export default router;