import type {Request, Response} from "express";
import { Questionarre, McqQuestion, TextQuestion } from "../../models/question.js";
import { createQuestionarreSchema } from "../../validation/admin/question.js";
import mongoose from "mongoose";

export const getAllQuestionnare = async (req: Request, res: Response) => {
    try{
        const questionnare = await Questionarre.find().populate("mcqQuestions").populate("textQuestions").lean();
        if(questionnare.length === 0){
            res.status(404).json({message: "No questionnare found"});
        }
        
        res.status(200).json({message: "Questionnare fetched successfully", data: questionnare});
    }
    catch(err){
        console.error("Error fetching questionnare:\n", err);
        res.status(500).json({message: "Error while fetching questionnare"});
    }
}

export const addQuestionnare = async (req: Request<{domainId: string}>, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {domainId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(domainId)){
            return res.status(400).json({message: "Invalid domain ID"});
        }

        const validation = createQuestionarreSchema.safeParse(req.body);
        if(!validation.success){
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({message: "Send valid data"});
        }

        const {mcqQuestions, textQuestions, dueDate} = validation.data;

        const mcqDocs = mcqQuestions?.length
            ? await McqQuestion.insertMany(mcqQuestions, {session})
            : [];

        const textDocs = textQuestions?.length
            ? await TextQuestion.insertMany(textQuestions, {session})
            : [];

        const questionnare = await Questionarre.create([
                {
                    domainId,
                    mcqQuestions: mcqDocs.map(doc => doc._id),
                    textQuestions: textDocs.map(doc => doc._id),
                    dueDate
                }
            ], 
            {session}
        );

        session.commitTransaction();

        res.status(201).json({message: "Questionnare created successfully", data: questionnare});

    }
    catch(err){
        session.abortTransaction();
        console.error("Error creating questionnare:\n", err);
        res.status(500).json({message: "Error while creating questionnare"});
    }
    finally{
        session.endSession();
    }
}

export const updateQuestionnare = async (req: Request<{questionnareId: string}>, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}

export const deleteQuestionnare = async (req: Request, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}

export const getResponse = async (req: Request, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}

export const updateMcqQuestion = async (req: Request<{questionId: string}>, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}

export const updateTextQuestion = async (req: Request<{questionId: string}>, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}