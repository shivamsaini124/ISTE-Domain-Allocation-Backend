import type {Request, Response, NextFunction} from 'express';
import { Admin } from '../models/admin.js';
import type { UserInterface } from '../types/user.js';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.user){
            return res.status(401).json({message: "Unauthorized: No user information provided"});
        }
        const user: UserInterface | undefined = req.user;

        const admin = await Admin.findOne({email: user.email});
        if (!admin) {
            return res.status(403).json({ message: 'Forbidden: User is not an admin' });
        }   

        req.user.id = admin._id.toString();
        next();
    } catch (err) {
        console.error('Error verifying admin:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
