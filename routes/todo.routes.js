import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../controllers/todo.controllers.js";

const router = Router();

router.post('/create', authMiddleware, createTodo);
router.get('/get', authMiddleware, getTodos);
router.put('/update/:id', authMiddleware, updateTodo);
router.delete('/delete/:id', authMiddleware, deleteTodo);

export default router;