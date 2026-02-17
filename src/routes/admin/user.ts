import type { Request, Response } from "express";

import { User } from "../../models/user.js";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().populate("selectedDomainIds").lean();
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({ message: "Users fetched successfully", data: users });
    } catch (error) {
        console.error("Error fetching users:\n", error);
        res.status(500).json({ message: "Error while fetching users" });
    }
}

export const getUser = async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate("selectedDomainIds").lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        console.error("Error fetching user:\n", error);
        res.status(500).json({ message: "Error while fetching user" });
    }
}

export const getUserByDomain = async (req: Request<{ domain: string }>, res: Response) => {
    try {
        const { domain } = req.params;

        const users = await User.find({ selectedDomainIds: domain }).populate("selectedDomainIds").lean();

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found for this domain" });
        }

        res.status(200).json({ message: `Users for domain ${domain} fetched successfully`, data: users });
    } catch (error) {
        console.error("Error fetching users by domain:\n", error);
        res.status(500).json({ message: "Error while fetching users by domain" });
    }
}