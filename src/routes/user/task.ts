import type {Request, Response} from "express";
import { Task } from "../../models/task.js";
import { Submission } from "../../models/submission.js";
import mongoose from "mongoose";
import { submitSubmissionSchema, updateSubmissionSchema } from "../../validation/user/task.js";
import { User } from "../../models/user.js";

export const getAllTask = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find().lean();
        res.status(200).json({message: "Tasks fetched successfully", data: tasks});
    } catch (error) {
        console.error("Error fetching tasks:\n", error);
        res.status(500).json({ message: "Error while fetching tasks" });
    }
}

export const getTaskByDomain = async (req: Request<{domainId: string}>, res: Response) => {
    try {
        const { domainId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(domainId)){
            return res.status(400).json({message: "Invalid domain ID"});
        }

        const task = await Task
            .find({ domainId: new mongoose.Types.ObjectId(domainId) })
            .lean();

        if(task.length === 0){
            return res.status(404).json({message: "No tasks found for this domain"});
        }

        res.status(200).json({message: "Tasks fetched successfully", data: task});
    } catch (error) {
        console.error("Error fetching tasks:\n", error);
        res.status(500).json({ message: "Error while fetching tasks" });
    }
}

export const submitSubmission = async (req: Request<{taskId: string}>, res: Response) => {
    try {
        const { taskId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "User not authenticated"});
        }

        const validation = submitSubmissionSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }


        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if(task.dueDate < new Date()){
            return res.status(403).json({message: "Task due date is over"});
        }

        const existingSubmission = await Submission.findOne({ userId, taskId });
        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this task" });
        }

        const {repoLink, dockLink} = validation.data;
        const submission = await Submission.create({
            userId,
            taskId,
            repoLink,
            dockLink,
            otherLink: validation.data.otherLink ?? null
        });

        res.status(201).json({ message: "Submission submitted successfully", data: submission });
    } catch (error) {
        console.error("Error submitting submission:\n", error);
        res.status(500).json({ message: "Error while     submitting submission" });
    }
}


export const getSubmission = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "User not authenticated"});
        }

        const submissions = await Submission
            .find({ userId })
            .populate("taskId")
            .lean();

        if(submissions.length === 0){
            return res.status(404).json({message: "No submissions found"});
        }
        
        return res.status(200).json({ message: "Submissions fetched successfully", data: submissions });

    } catch (error) {
        console.error("Error fetching submissions:\n", error);
        res.status(500).json({ message: "Error while fetching submissions" });
    }
}

export const updateSubmission = async (req: Request<{submissionId: string}>, res: Response) => {
    try {
        const { submissionId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(submissionId)){
            return res.status(400).json({message: "Invalid submission ID"});
        }
        
        const validation = updateSubmissionSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "User not authenticated"});
        }

        const submission = await Submission.findById(submissionId).populate<{taskId: {dueDate: Date}}>("taskId");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found"});
        }

        if(submission.userId.toString() !== userId){
            return res.status(403).json({message: "You are not authorized to update this submission"});
        }

        if(submission.taskId.dueDate < new Date()){
            return res.status(403).json({message: "Submission due date is over"});
        }

        const { repoLink, dockLink, otherLink } = validation.data;

        submission.repoLink = repoLink ?? submission.repoLink;
        submission.dockLink = dockLink ?? submission.dockLink;
        
        if(otherLink){
            submission.otherLink = otherLink;
        }

        await submission.save();

        res.status(200).json({ message: "Submission updated successfully", data: submission });
    } catch (error) {
        console.error("Error updating submission:\n", error);
        res.status(500).json({ message: "Error while updating submission" });
    }
}

export const deleteSubmission = async (req: Request<{submissionId: string}>, res: Response) => {
    try {
        const { submissionId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(submissionId)){
            return res.status(400).json({message: "Invalid submission ID"});
        }

        const userId = req.user?.id;
        const submission = await Submission.findById(submissionId).lean();

        if(submission?.userId.toString() !== userId){
            return res.status(403).json({message: "You are not authorized to delete this submission"});
        }

        await Submission.deleteOne({_id: submissionId});
        res.status(200).json({message: "Submission deleted successfully"});
    } catch (error) {
        console.error("Error deleting submission:\n", error);
        res.status(500).json({ message: "Error while deleting submission" });
    }
}