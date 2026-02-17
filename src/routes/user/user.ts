import { Router } from "express";
import { verifyFirebaseToken } from "../../middlewares/firebase.js";
import { loginOrSignup } from "./login.js";
import { verifyUser } from "../../middlewares/user.js";
import { completeProfile, getProfile, updateProfile } from "./profile.js";
import {getAllDomains, getDomain, applyForDomain} from "./domain.js";
import { getQuestionnareByDomain, getResponse, submitResponse, updateResponse} from "./question.js";
import { getInterviews } from "./interview.js";
import { getAllTask, getSubmission, getTaskByDomain, submitSubmission, updateSubmission, deleteSubmission } from "./task.js";

export const UserRouter: Router = Router();

UserRouter.use(verifyFirebaseToken);
UserRouter.post("/login", loginOrSignup);

UserRouter.use(verifyUser);
UserRouter.get("/profile", getProfile);
UserRouter.post("/profile/complete", completeProfile);
UserRouter.put("/profile/update", updateProfile);

UserRouter.get("/domain", getAllDomains);
UserRouter.get("/domain/:domainId", getDomain);
UserRouter.post("/domain/apply", applyForDomain);

UserRouter.get("/questionnare/:domainId", getQuestionnareByDomain);

UserRouter.get("/response", getResponse);
UserRouter.post("/response", submitResponse);
UserRouter.put("/response/:responseId", updateResponse);

UserRouter.get("/interview", getInterviews);

UserRouter.get("/task", getAllTask);
UserRouter.get("/task/:domainId", getTaskByDomain);

UserRouter.get("/submission", getSubmission);
UserRouter.post("/submission/:taskId", submitSubmission);
UserRouter.put("/submission/:submissionId", updateSubmission);
UserRouter.delete("/submission/:submissionId", deleteSubmission);