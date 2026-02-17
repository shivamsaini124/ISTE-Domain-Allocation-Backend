import type {Request, Response} from "express";
import { Interview } from "../../models/interview";
import { User } from "../../models/user";

export const getInterviews = async (req: Request, res: Response) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const interviews = await Interview.find({ userId: user._id })
            .populate("domainId")
            .sort({ datetime: 1 });

        res.status(200).json({
            message: "Interviews fetched successfully",
            data: interviews
        });
    } catch (error) {
        console.error("Error fetching user interviews:\n", error);
        res.status(500).json({ message: "Error while fetching interviews" });
    }
}