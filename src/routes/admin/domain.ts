import type {Response, Request} from 'express';
import { Domain } from '../../models/domain';
import { addDomainSchema, updateDomainSchema } from '../../validation/admin/domain';
import mongoose from 'mongoose';

export const getDomain = async (req: Request<{domainId: string}>, res: Response) => {
    try {
        const { domainId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(domainId)){
            return res.status(400).json({ message: "Invalid domain ID" });
        }

        const domain = await Domain.findById(domainId);
        if (!domain) {
            return res.status(404).json({message: "Domain not found"});
        }
        res.status(200).json({message: "Domain fetched successfully", data:domain});
    } catch (error) {
        console.error("Error fetching domain:\n", error);
        res.status(500).json({ message: "Error while fetching domain" });
    }
};

export const getAllDomains = async (req: Request, res: Response) => {
    try {
        const domains = await Domain.find();
        res.status(200).json({message: "Domains fetched successfully", data:domains});
    } catch (error) {
        console.error("Error fetching domains:\n", error);
        res.status(500).json({ message: "Error while fetching domains" });
    }
};

export const addDomain = async (req: Request, res: Response) => {
    try {
        const validation = addDomainSchema.safeParse(req.body);
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        
        const newDomain = await Domain.create(validation.data);

        res.status(201).json({message: "Domain added successfully", data: newDomain });
    } catch (error:any) {
        if (error.code === 11000) {
            console.log("Domain already exists")
            return res.status(400).json({ message: "Domain already exists" });
        }

        console.error("Error adding domain:\n", error);
        res.status(500).json({message: "Error while adding Domain"});
    }
};

export const removeDomain = async (req: Request<{domainId: string}>, res: Response) => {
    try {
        const {domainId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(domainId)){
            return res.status(400).json({ message: "Invalid domain ID" });
        }  

        const deletedDomain = await Domain.findByIdAndDelete(domainId);
        if (!deletedDomain) {
            return res.status(404).json({ message: "Domain not found" });
        }
        res.status(200).json({ message: "Domain deleted successfully" });
    } catch (error) {
        console.error("Error removing domain:\n", error);
        res.status(500).json({ message: "Error while deleting Domain"});
    }
};

export const updateDomain = async (req: Request<{domainId: string}>, res: Response) => {
    try {
        const { domainId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(domainId)){
            return res.status(400).json({ message: "Invalid domain ID" });
        }

        const validation = updateDomainSchema.safeParse(req.body);
        
        if (!validation.success) {
            console.error("Validation error:\n", validation.error);
            return res.status(400).json({ message: "Send valid data" });
        }

        const updatedDomain = await Domain.findByIdAndUpdate(
            domainId,
            {$set: validation.data},
            {new: true, runValidators: true}
        );
        if (!updatedDomain) {
            return res.status(404).json({ message: "Domain not found" });
        }
        res.status(200).json({message: "Domain updated successfully", data: updatedDomain});
    } catch (error) {
        console.error("Error updating domain:\n", error);
        res.status(500).json({ message: "Error while updating Domain"});
    }
};