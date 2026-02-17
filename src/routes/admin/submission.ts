import type {Request, Response} from "express";
import {Submission} from "../../models/submission"

export const getAllSubmission = async (req: Request, res: Response) => {
    try{
        const submissions = await Submission.find()
            .populate("userId", "name regNo email")
            .populate("taskId")
            .lean();

        if(submissions.length === 0){
            return res.status(404).json({message: "No submissions found"});
        }

        res.status(200).json({message: "Submissions fetched successfully", data: submissions});
    }
    catch(err){ 
        console.error("Error fetching submissions:\n", err);
        res.status(500).json({message: "Error while fetching submissions"});
    }
}