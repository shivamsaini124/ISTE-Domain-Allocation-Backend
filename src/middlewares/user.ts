import type {Request, Response, NextFunction} from 'express';
import { User } from '../models/user';
import type { UserInterface } from '../types/user';

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.user){
            return res.status(401).json({message: "Unauthorized: No user information provided"});
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: No user information provided' });
        }

        const userFound = await User.findOne({email: user.email});
        if (!userFound) {
            return res.status(403).json({ message: 'Forbidden: User is not signed up' });
        }

        req.user.id = userFound._id.toString();

        next();
    } catch (err) {
        console.error('Error verifying user:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
