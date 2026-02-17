import type { Request, Response } from "express";
import {Interview} from "../../models/interview";
import {z} from "zod";
import {scheduleInterviewSchema, updateInterviewSchema} from "../../validation/admin/interview";

export const getAllInterviews = async (req: Request, res: Response) => {
    try {
        const interviews = await Interview.find().populate("userId").populate("domainId");
        res.status(200).json({ message: "Interviews fetched successfully", data: interviews });
    } catch (error) {
        console.error("Error fetching interviews:\n", error);
        res.status(500).json({ message: "Error while fetching interviews" });
    }
};

export const getInterviewById = async (req: Request, res: Response) => {
    try {
        const { interviewId } = req.params;
        const interview = await Interview.findById(interviewId).populate("userId").populate("domainId");
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        res.status(200).json({ message: "Interview fetched successfully", data: interview });
    } catch (error) {
        console.error("Error fetching interview:\n", error);
        res.status(500).json({ message: "Error while fetching interview" });
    }
};

export const scheduleInterview = async (req: Request, res: Response) => {
    try {
        const validation = scheduleInterviewSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({message: "Send Valid data"});
        }

        const { userId, domainId, datetime, durationMinutes, meetLink } = validation.data;
        const newInterview = await Interview.create({ userId, domainId, datetime, durationMinutes, meetLink });
        res.status(201).json({ message: "Interview scheduled successfully", data: newInterview });
    } catch (error) {
        console.error("Error scheduling interview:\n", error);
        res.status(500).json({ message: "Error while scheduling interview" });
    }
};

export const updateInterview = async (req: Request, res: Response) => {
    try {
        const validation = updateInterviewSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const { datetime, durationMinutes, meetLink } = validation.data;
        const updatedInterview = await Interview.findByIdAndUpdate(
            req.params.interviewId,
            { datetime, durationMinutes, meetLink },
            { new: true }
        );

        if (!updatedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        res.status(200).json({ message: "Interview updated successfully", data: updatedInterview });
    } catch (error) {
        console.error("Error updating interview:\n", error);
        res.status(500).json({ message: "Error while updating interview" });
    }
};

export const cancelInterview = async (req: Request, res: Response) => {
    try {
        const { interviewId } = req.params;
        const deletedInterview = await Interview.findByIdAndDelete(interviewId);
        if (!deletedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        res.status(200).json({ message: "Interview cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling interview:\n", error);
        res.status(500).json({ message: "Error while cancelling interview" });
    }
};