import type {Request, Response} from "express";
import {Questionnaire} from "../../models/question"
import mongoose from "mongoose";
import { Response as ResponseModel} from "../../models/answer";
import { User } from "../../models/user";
import {submitResponseSchema, updateResponseSchema } from "../../validation/user/question";

export const getQuestionnaireByDomain = async (req: Request<{ domainId: string }>,res: Response) => {
  try {
    const { domainId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(domainId)) {
      return res.status(400).json({ message: "Invalid domain ID" });
    }

    const questionnaire = await Questionnaire.findOne({ domainId })
      .populate("mcqQuestions")
      .populate("textQuestions");

    if (!questionnaire) {
      return res.status(404).json({
        message: "Questionnaire not found for this domain"
      });
    }

    if (questionnaire.dueDate < new Date()) {
      return res.status(403).json({
        message: "Questionnaire due date is over"
      });
    }

    return res.status(200).json({
      message: "Questionnaire fetched successfully",
      data: questionnaire
    });

  } catch (error) {
    console.error("Error fetching questionnaire:\n", error);
    return res.status(500).json({
      message: "Error while fetching questionnaire"
    });
  }
};


export const submitResponse = async (req: Request, res: Response) => {
    try{
        const validation = submitResponseSchema.safeParse(req.body);
        if(!validation.success){
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({message: "Send valid data"});
        }

        const {questionnaireId, mcqAnswers, textAnswers} = validation.data;

        const questionnaire = await Questionnaire.findById(questionnaireId)
            .populate("mcqQuestions")
            .populate("textQuestions");


        if(!questionnaire){
            return res.status(404).json({message: "Questionnaire not found"});
        }

        const requiredMcqIds = new Set(questionnaire.mcqQuestions.map(q => q._id.toString()));
        const requiredTextIds = new Set(questionnaire.textQuestions.map(q => q._id.toString()));

        const submittedMcqIds = new Set(mcqAnswers.map(a => a.questionId));
        const submittedTextIds = new Set(textAnswers.map(a => a.questionId));

        if (submittedMcqIds.size !== mcqAnswers.length) {
            return res.status(400).json({ message: "Duplicate MCQ answers submitted" });
        }

        if (submittedTextIds.size !== textAnswers.length) {
            return res.status(400).json({ message: "Duplicate text answers submitted" });
        }

        if (requiredMcqIds.size !== submittedMcqIds.size || requiredTextIds.size !== submittedTextIds.size) {
            return res.status(400).json({ message: "You must answer all questions" });
        }

        for (const id of submittedMcqIds) {
            if (!requiredMcqIds.has(id)) {
                return res.status(400).json({ message: `Question with id ${id} is not in this questionnaire` });
            }
        }

        for (const id of submittedTextIds) {
            if (!requiredTextIds.has(id)) {
                return res.status(400).json({ message: `Question with id ${id} is not in this questionnaire` });
            }
        }

        for (const answer of mcqAnswers) {
            const question = (questionnaire.mcqQuestions as any[]).find(q => q._id.toString() === answer.questionId);
            if (!question) {
                // This case should be covered by the ID set checks, but it's good for robustness
                return res.status(400).json({ message: `MCQ Question with id ${answer.questionId} not found in questionnaire` });
            }
            if (answer.selectedOptionIndex < 0 || answer.selectedOptionIndex >= question.options.length) {
                return res.status(400).json({ message: `Invalid option index for question ${question.question}` });
            }
        }

        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({message: "User not authenticated"});
        }

        const user = await User.findOne({email: userEmail}).lean();
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const existingResponse = await ResponseModel.findOne({ userId: user._id, questionnaireId });
        if (existingResponse) {
            return res.status(409).json({ message: "You have already submitted a response for this questionnaire" });
        }

        const newResponse = await ResponseModel.create({
            userId: user._id,
            questionnaireId,
            mcqAnswers,
            textAnswers,
        });


        return res.status(201).json({ message: "Response submitted successfully", data: newResponse});
    }
    catch(err){
        console.error("Error submitting response:\n", err);
        res.status(500).json({message: "Error while submitting response"});
    }
};

export const getResponse = async (req: Request, res: Response) => {
    try{
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({message: "User not authenticated"});
        }

        const user = await User.findOne({email: userEmail}).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const response = await ResponseModel.find({userId: user._id}).populate("mcqAnswers.questionId").populate("textAnswers.questionId");
        res.status(200).json({message: "Response fetched successfully", data: response});
    }
    catch(err){
        console.error("Error fethching response:\n", err);
        res.status(500).json({message: "Error while fetching response"});
    }
}

export const updateResponse = async (req: Request<{responseId: string}>, res: Response) => {
    try {
        const { responseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(responseId)) {
            return res.status(400).json({ message: "Invalid response ID" });
        }

        const validation = updateResponseSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const {mcqAnswers, textAnswers} = validation.data;

        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await User.findOne({ email: userEmail }).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingResponse = await ResponseModel.findOne({ _id: responseId, userId: user._id }).populate("mcqAnswers.questionId").populate("textAnswers.questionId");
        if (!existingResponse) {
            return res.status(404).json({ message: "Response not found or you are not authorized to update it" });
        }

        const requiredMcqIds = new Set(existingResponse.mcqAnswers.map(a => a.questionId._id.toString()));
        const requiredTextIds = new Set(existingResponse.textAnswers.map(a => a.questionId._id.toString()));

        function hasDuplicateQuestionId(arr: { questionId: string }[]): boolean {
            const ids = arr.map(a => a.questionId.toString());
            return new Set(ids).size !== ids.length;
        }



        if(mcqAnswers){
            if(hasDuplicateQuestionId(mcqAnswers)){
                return res.status(400).json({"message": "Duplication of answers is not allowed"});
            }
            for (const answer of mcqAnswers) {
                if(!requiredMcqIds.has(answer.questionId)) {
                    return res.status(400).json({ message: `Question with id ${answer.questionId} is not in this questionnaire` });
                }

                const index = existingResponse.mcqAnswers.findIndex(a =>
                    a.questionId._id.toString() === answer.questionId
                );

                if (index > -1 && existingResponse.mcqAnswers[index]) {
                    existingResponse.mcqAnswers[index].selectedOptionIndex = answer.selectedOptionIndex;
                }
            }
        }
        
        if(textAnswers){
            if(hasDuplicateQuestionId(textAnswers)){
                return res.status(400).json({"message": "Duplication of answers is not allowed"});
            }
            for (const answer of textAnswers) {
                if(!requiredTextIds.has(answer.questionId)) {
                    return res.status(400).json({ message: `Question with id ${answer.questionId} is not in this questionnaire` });
                }

                const index = existingResponse.textAnswers.findIndex(a =>
                    a.questionId._id.toString() === answer.questionId
                );

                if (index > -1 && existingResponse.textAnswers[index]) {
                    existingResponse.textAnswers[index].answerText = answer.answerText;
                }
            }
        }

        await existingResponse.save();

        return res.status(200).json({ message: "Response updated successfully", data: existingResponse });

    } catch (err) {
        console.error("Error updating response:\n", err);
        res.status(500).json({ message: "Error while updating response" });
    }
}
