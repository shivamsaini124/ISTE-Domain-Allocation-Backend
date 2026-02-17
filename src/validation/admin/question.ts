import { z } from "zod";

// MCQ Question Schema
export const mcqQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),

  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options are required"),

  correctOptionIndex: z.number().int().nonnegative(),
}).refine(
  (data) => data.correctOptionIndex < data.options.length,
  {
    message: "correctOptionIndex must be within options range",
    path: ["correctOptionIndex"],
  }
);

// Text Question Schema
export const textQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

// Main Create Questionnaire Schema
export const createQuestionnaireSchema = z
  .object({
    mcqQuestions: z.array(mcqQuestionSchema).optional(),

    textQuestions: z.array(textQuestionSchema).optional(),

    dueDate: z.coerce.date(),
  })
  .refine(
    (data) =>
      (data.mcqQuestions?.length ?? 0) +
      (data.textQuestions?.length ?? 0) >
      0,
    {
      message: "At least one question is required",
    }
  );


export const updateQuestionnaireSchema = z.object({
    dueDate: z.string().datetime()
})