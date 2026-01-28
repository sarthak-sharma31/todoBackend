import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  isCompleted:{
    type: Boolean,
    default: false
  },

  inProgress:{
    type: Boolean,
    default: false
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  priority: {
    type: Number,
    min: 1,
    max: 4,
    default: 4
  },

  dueDate: {
    type: Date
  }

}, { timestamps: true });

export const Todo = mongoose.model("Todo", todoSchema);
