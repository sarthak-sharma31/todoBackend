import { User } from "../models/user.models.js";
import { Todo } from "../models/task.models.js";

const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const todo = await Todo.create({
            title,
            description,
            user: req.user.id
        });

        return res.status(200).json({ message: "Task Created", todo });
    } catch (error) {
        res.status(500).json({ message: "Failed to create todo" });
    }

};

const getTodos = async (req, res) => {
    try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({todos});
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};

const updateTodo = async (req, res) => {
    try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({todo});
  } catch (error) {
    res.status(500).json({ message: "Failed to update todo" });
  }
};

const deleteTodo = async (req, res) => {
    try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete todo" });
  }
};

export { createTodo, getTodos, updateTodo, deleteTodo }