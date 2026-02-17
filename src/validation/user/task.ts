import {z} from 'zod';

export const submitSubmissionSchema = z.object({
    repoLink: z.string().url(),
    dockLink: z.string().url(),
    otherLink: z.string().url().optional(),
})

export const updateSubmissionSchema = z.object({
    repoLink: z.string().url().optional(),
    dockLink: z.string().url().optional(),
    otherLink: z.string().url().optional(),
})