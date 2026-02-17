import type { Request, Response } from "express";
import type { UserInterface } from "../../types/user";
import { Admin } from "../../models/admin";

export const login = async (req: Request, res: Response) => {
    try{
        const user: UserInterface | undefined = req.user;
        if(!user){
            return  res.status(401).json({message: "Unauthorized: No user information provided"});
        }

        const adminFound = await Admin.findOne(
            {email: user.email}
        )?.lean();

        if(!adminFound){
            return res.status(403).json({message: "User is not an admin"});
        }

        res.json({message: "Logged in successfully", user: adminFound});
    }
    catch(err){
        console.error("Error while login: "+ err);
        res.status(500).json({message: "Internal Server Error"});
    }
}