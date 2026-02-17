import { z } from "zod";
import mongoose from "mongoose";

export const submitResponseSchema = z.object({
  questionnaireId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid questionnaire ID",
  }),
  mcqAnswers: z.array(
    z.object({
      questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid MCQ question ID",
      }),
      selectedOptionIndex: z.number().int().min(0).max(3),
    })
  ).default([]),
  textAnswers: z.array(
    z.object({
      questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid text question ID",
      }),
      answerText: z.string().min(1),
    })
  ).default([]),
});

export const updateResponseSchema = z.object({
  mcqAnswers: z.array(
    z.object({
      questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid MCQ question ID",
      }),
      selectedOptionIndex: z.number().int().min(0).max(3),
    })
  ).default([]).optional(),
  textAnswers: z.array(
    z.object({
      questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid text question ID",
      }),
      answerText: z.string().min(1),
    })
  ).default([]).optional()
});