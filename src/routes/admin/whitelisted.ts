import type { Request, Response } from 'express';
import { WhitelistedUser } from '../../models/whitelistedUser';

export const getWhitelistedUsers = async (req: Request, res: Response) => {
    try {
        const users = await WhitelistedUser.find();
        res.status(200).json({ message: "Whitelisted users fetched successfully", data: users });
    } catch (error) {
        console.error("Error fetching whitelisted users:\n", error);
        res.status(500).json({ message: "Error while fetching whitelisted users" });
    }
};

export const addWhitelistedUsers = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const newUser = await WhitelistedUser.create({ email }).catch((error) => {
            if (error.code === 11000) {
                return res.status(400).json({ message: "User already whitelisted" });
            }
            throw error;
        });

        if (!newUser) return;

        res.status(201).json({ message: "User whitelisted successfully", data: newUser });
    } catch (error) {
        console.error("Error adding whitelisted user:\n", error);
        res.status(500).json({ message: "Error while adding whitelisted user" });
    }
};

export const removeWhitelistedUsers = async (req: Request, res: Response) => {
    try {
        const { whitelistId } = req.params;
        const deletedUser = await WhitelistedUser.findByIdAndDelete(whitelistId);
        if (!deletedUser) {
            return res.status(404).json({ message: "Whitelisted user not found" });
        }
        res.status(200).json({ message: "Whitelisted user removed successfully" });
    } catch (error) {
        console.error("Error removing whitelisted user:\n", error);
        res.status(500).json({ message: "Error while removing whitelisted user" });
    }
};