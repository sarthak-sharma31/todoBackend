import mongoose from "mongoose";
import { Todo } from "../models/task.models.js";
import { Team } from "../models/team.models.js";


const createTodo = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const team = req.user.team
      ? await Team.findById(req.user.team)
      : null;

    const isOwner = team && team.owner.toString() === req.user.id;

    if (!isOwner && assignedTo && assignedTo !== req.user.id) {
      return res.status(403).json({
        message: "Only team owner can assign tasks to others"
      });
    }

    const todo = await Todo.create({
      title,
      description,
      createdBy: new mongoose.Types.ObjectId(req.user.id),
      assignedTo: new mongoose.Types.ObjectId(assignedTo || req.user.id),
      priority,
      dueDate
    });


    res.status(201).json({ message: "Todo created", todo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create todo" });
  }
};

const getTodos = async (req, res) => {
  try {
    let filter = {};

    if (req.user.team) {
      const team = await Team.findById(req.user.team);
      const isOwner = team.owner.toString() === req.user.id;

      // Owner sees everything in team
      if (!isOwner) {
        filter = {
          $or: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        };
      }
    } else {
      // User without team
      filter = {
        $or: [
          { assignedTo: req.user.id },
          { createdBy: req.user.id }
        ]
      };
    }

    const todos = await Todo.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ todos });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found or access denied" });
    }

    Object.assign(todo, req.body);
    await todo.save();

    res.status(200).json({ todo });

  } catch (error) {
    res.status(500).json({ message: "Failed to update todo" });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found or access denied" });
    }

    res.status(200).json({ message: "Todo deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete todo" });
  }
};

export {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
};