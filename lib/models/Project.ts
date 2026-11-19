import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  managerId: mongoose.Types.ObjectId; // Kis employee ne banaya
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold"],
      default: "planning",
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee", // Employee model se link
      required: true,
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);

export default Project;