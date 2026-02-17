import type { Request, Response } from "express";
import { Questionnaire, McqQuestion, TextQuestion } from "../../models/question.js";
import { createQuestionnaireSchema, mcqQuestionSchema, textQuestionSchema } from "../../validation/admin/question.js";
import { Response as ResponseModel } from "../../models/answer.js";
import mongoose from "mongoose";

export const getAllQuestionnaire = async (req: Request, res: Response) => {
    try {
        const questionnaire = await Questionnaire.find().populate("mcqQuestions").populate("textQuestions").lean();
        if (questionnaire.length === 0) {
            res.status(404).json({ message: "No questionnaire found" });
        }

        res.status(200).json({ message: "Questionnaire fetched successfully", data: questionnaire });
    }
    catch (err) {
        console.error("Error fetching questionnaire:\n", err);
        res.status(500).json({ message: "Error while fetching questionnaire" });
    }
}

export const addQuestionnaire = async (req: Request<{ domainId: string }>, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { domainId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(domainId)) {
            return res.status(400).json({ message: "Invalid domain ID" });
        }

        const validation = createQuestionnaireSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const { mcqQuestions, textQuestions, dueDate } = validation.data;

        const mcqDocs = mcqQuestions?.length
            ? await McqQuestion.insertMany(mcqQuestions, { session })
            : [];

        const textDocs = textQuestions?.length
            ? await TextQuestion.insertMany(textQuestions, { session })
            : [];

        const questionnaire = await Questionnaire.create([
            {
                domainId,
                mcqQuestions: mcqDocs.map(doc => doc._id),
                textQuestions: textDocs.map(doc => doc._id),
                dueDate
            }
        ],
            { session }
        );

        session.commitTransaction();

        res.status(201).json({ message: "Questionnaire created successfully", data: questionnaire });

    }
    catch (err) {
        session.abortTransaction();
        console.error("Error creating questionnaire:\n", err);
        res.status(500).json({ message: "Error while creating questionnaire" });
    }
    finally {
        session.endSession();
    }
}

export const updateQuestionnaire = async (req: Request<{questionnaireId: string}>, res: Response) => {
    try {
        const { questionnaireId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(questionnaireId)) {
            return res.status(400).json({ message: "Invalid questionnaire ID" });
        }

        const validation = createQuestionnaireSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const { dueDate } = validation.data;

        const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(
            questionnaireId,
            { dueDate: new Date(dueDate) },
            { new: true }
        );

        if (!updatedQuestionnaire) {
            return res.status(404).json({ message: "Questionnaire not found" });
        }

        res.status(200).json({ message: "Questionnaire updated successfully", data: updatedQuestionnaire });
    } catch (err) {
        console.error("Error updating questionnaire:\n", err);
        res.status(500).json({ message: "Error while updating questionnaire" });
    }
}

export const deleteQuestionnaire = async (req: Request<{ questionnaireId: string }>, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { questionnaireId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(questionnaireId)) {
            return res.status(400).json({ message: "Invalid questionnaire ID" });
        }

        const questionnaire = await Questionnaire.findById(questionnaireId).session(session);
        if (!questionnaire) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Questionnaire not found" });
        }

        // Delete associated questions
        if (questionnaire.mcqQuestions && questionnaire.mcqQuestions.length > 0) {
            await McqQuestion.deleteMany({ _id: { $in: questionnaire.mcqQuestions } }, { session });
        }
        if (questionnaire.textQuestions && questionnaire.textQuestions.length > 0) {
            await TextQuestion.deleteMany({ _id: { $in: questionnaire.textQuestions } }, { session });
        }

        await Questionnaire.findByIdAndDelete(questionnaireId, { session });

        await session.commitTransaction();
        res.status(200).json({ message: "Questionnaire deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error deleting questionnaire:\n", error);
        res.status(500).json({ message: "Error while deleting questionnaire" });
    } finally {
        session.endSession();
    }
}

export const getResponse = async (req: Request, res: Response) => {
    try {
        const responses = await ResponseModel.find()
            .populate("userId", "name regNo email")
            .populate("questionnaireId")
            .populate("mcqAnswers.questionId")
            .populate("textAnswers.questionId")
            .lean();

        if (responses.length === 0) {
            return res.status(404).json({ message: "No responses found" });
        }

        res.status(200).json({ message: "Responses fetched successfully", data: responses });
    } catch (error) {
        console.error("Error fetching responses:\n", error);
        res.status(500).json({ message: "Error while fetching responses" });
    }
}

export const updateMcqQuestion = async (req: Request<{ questionId: string }>, res: Response) => {
    try {
        const { questionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const validation = mcqQuestionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: "Send valid data", error: validation.error });
        }

        const question = await McqQuestion.findByIdAndUpdate(questionId, validation.data, { new: true }).lean();
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ message: "MCQ Question updated successfully", data: question });
    } catch (error) {
        console.error("Error updating MCQ question:\n", error);
        res.status(500).json({ message: "Error while updating MCQ question" });
    }
}

export const updateTextQuestion = async (req: Request<{ questionId: string }>, res: Response) => {
    try {
        const { questionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const validation = textQuestionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: "Send valid data", error: validation.error });
        }

        const question = await TextQuestion.findByIdAndUpdate(questionId, validation.data, { new: true }).lean();
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ message: "Text Question updated successfully", data: question });
    } catch (error) {
        console.error("Error updating Text question:\n", error);
        res.status(500).json({ message: "Error while updating Text question" });
    }
}

export const deleteTextQuestion = async (req: Request<{questionId: string}>, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}

export const deleteMcqQuestion = async (req: Request<{questionId: string}>, res: Response) => {
    res.status(501).json({message: "Not implemented"});
}