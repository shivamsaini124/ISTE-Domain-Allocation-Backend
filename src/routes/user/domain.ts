import mongoose from "mongoose";
import type {Request, Response} from "express";
import { Domain } from "../../models/domain.js";
import { User } from "../../models/user.js";

export const getAllDomains = async (req: Request, res: Response) => {
    try {
        const domains = await Domain.find();
        res.status(200).json({message: "Domains fetched successfully", data: domains});
    } catch (error) {
        console.error("Error fetching domains:\n", error);
        res.status(500).json({ message: "Error while fetching domains" });
    }
}

export const getDomain = async (req: Request<{domainId: string}>, res: Response) => {
    try {
        const { domainId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(domainId)) {
            return res.status(400).json({ message: "Invalid domain ID" });
        }

        const domain = await Domain.findById(domainId);
        if (!domain) {
            return res.status(404).json({message: "Domain not found"});
        }
        res.status(200).json({message: "Domain fetched successfully", data: domain});
    } catch (error) {
        console.error("Error fetching domain:\n", error);
        res.status(500).json({ message: "Error while fetching domain" });
    }
}

export const applyForDomain = async (req: Request, res: Response) => {
  try {
    const { domainIds } = req.body; // expecting array

    if (!Array.isArray(domainIds) || domainIds.length === 0) {
      return res.status(400).json({
        message: "domainIds must be a non-empty array",
      });
    }

    if (domainIds.length > 2) {
      return res.status(400).json({
        message: "You can apply for maximum 2 domains at once",
      });
    }

    // Validate ObjectIds
    for (const id of domainIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: `Invalid domain ID: ${id}`,
        });
      }
    }

    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add domains
    user.selectedDomainIds = domainIds;
    await user.save();

    res.status(200).json({
      message: "Domain(s) applied successfully",
      data: user,
    });

  } catch (error: any) {
    console.error("Error applying for domain:\n", error);

    res.status(500).json({
      message: "Error while applying for domain",
    });
  }
};
