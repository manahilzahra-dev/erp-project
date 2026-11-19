import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId; // Employee ID
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);

export default Task;