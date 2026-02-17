import type { Request, Response } from "express";

import { Task } from "../../models/task.js";
import { taskSchema, updateTaskSchema } from "../../validation/admin/task.js";
import mongoose from "mongoose";

export const getTask = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find().populate('domainId').lean();
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json({ message: "Tasks fetched successfully", data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:\n", error);
        res.status(500).json({ message: "Error while fetching tasks" });
    }
}

export const addTask = async (req: Request, res: Response) => {
    try {
        const validation = taskSchema.safeParse(req.body);

        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data", error: validation.error });
        }

        const { title, description, dueDate, domainId } = validation.data;

        if (!mongoose.Types.ObjectId.isValid(domainId)) {
            return res.status(400).json({ message: "Invalid domain ID" });
        }

        const task = await Task.create({
            title,
            description,
            dueDate,
            domainId
        });

        res.status(201).json({ message: "Task created successfully", data: task });
    } catch (error) {
        console.error("Error adding task:\n", error);
        res.status(500).json({ message: "Error while adding task" });
    }
}

export const updateTask = async (req: Request<{ taskId: string }>, res: Response) => {
    try {
        const { taskId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const validation = updateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error)
            return res.status(400).json({ message: "Send valid data"});
        }

        const task = await Task.findByIdAndUpdate(taskId, validation.data, { new: true }).lean();

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task updated successfully", data: task });
    } catch (error) {
        console.error("Error updating task:\n", error);
        res.status(500).json({ message: "Error while updating task" });
    }
}

export const deleteTask = async (req: Request<{ taskId: string }>, res: Response) => {
    try {
        const { taskId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:\n", error);
        res.status(500).json({ message: "Error while deleting task" });
    }
}