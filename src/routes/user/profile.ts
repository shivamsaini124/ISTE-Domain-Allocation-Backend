import type {Request, Response} from 'express';
import { User } from '../../models/user';
import { completeProfileSchema, updateProfileSchema } from '../../validation/user/profile';

export const getProfile = async (req: Request, res: Response) => {
    try{
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({message: "User not authenticated"});
        }

        const user = await User.findOne({email: userEmail});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({message: "Profile fetched successfully", data: user});
    }
    catch(err){
        console.error("Error fetching profile:\n", err);
    }
}

export const completeProfile = async (req: Request, res: Response) => {
    try{
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({message: "User not authenticated"});
        }

        const validation = completeProfileSchema.safeParse(req.body);
        if(!validation.success){
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({message: "Send valid data"});
        }

        const user = await User.findOneAndUpdate(
            {email: userEmail},
            validation.data,
            {new: true, runValidators: true}   
        ).lean();

        res.status(200).json({message: "Profile completed successfully", data: user});
    }
    catch(err){
        console.error("Error completing profile:\n", err);
        res.status(500).json({message: "Error while completing profile"});
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: userEmail },
            { $set: validation.data },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
    } catch (err) {
        console.error("Error updating profile:\n", err);
        res.status(500).json({ message: "Error while updating profile" });
    }
};
