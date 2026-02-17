import { z } from "zod";

export const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    dueDate: z.string().datetime(),
    domainId: z.string().min(1, "Domain ID is required"),
});

export const updateTaskSchema = taskSchema.partial();
