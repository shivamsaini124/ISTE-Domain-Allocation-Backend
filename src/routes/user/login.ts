import type { Request, Response } from "express";
import type { UserInterface } from "../../types/user";
import { User } from "../../models/user";
import { WhitelistedUser } from "../../models/whitelistedUser";

export const loginOrSignup = async (req: Request, res: Response) => {
    try{
        const user: UserInterface | undefined = req.user;
        if(!user){
            return  res.status(401).json({message: "Unauthorized: No user information provided"});
        }

        //Checking if user is whitelisted or not
        // const whitelistedUser = await WhitelistedUser.findOne({email: user.email});

        // if(!whitelistedUser){
        //     return res.status(403).json({message: "User is not registered for the Chapter"});
        // }

        const userFound = await User.findOneAndUpdate(
            {email: user.email},
            {
                $setOnInsert: {
                    ...user,
                    selectedDomainIds: []
                }
            },
            {
                upsert: true,
                new: true
            }
        ).lean();

        if(!userFound){
            return res.status(500).json({message: "Error creating/checking user"});
        }
        
        res.status(200).json({message: "Logged in successfully", user: userFound});
    }
    catch(err){
        console.error("Error while login: "+ err);
        res.status(500).json({message: "Internal Server Error"});
    }
}