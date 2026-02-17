import {Router} from "express";
import {verifyFirebaseToken} from "../../middlewares/firebase";
import {login} from "./login";
import {getAllUsers, getUser} from "./user";
import {verifyAdmin} from "../../middlewares/admin";
import {getWhitelistedUsers, addWhitelistedUsers, removeWhitelistedUsers} from "./whitelisted";
import {getUserByDomain} from "./user";
import {getDomain, getAllDomains, addDomain, removeDomain, updateDomain} from "./domain";
import { addQuestionnaire, updateQuestionnaire, deleteQuestionnaire, getAllQuestionnaire, getResponse, updateTextQuestion, updateMcqQuestion, deleteMcqQuestion, deleteTextQuestion } from "./question";
import { getAllInterviews, getInterviewById, updateInterview, cancelInterview, scheduleInterview } from "./interview";
import { getTask, addTask, deleteTask, updateTask } from "./task";
import { getAllSubmission } from "./submission";

export const AdminRouter: Router = Router();

AdminRouter.use(verifyFirebaseToken);
AdminRouter.post("/login", login);

AdminRouter.use(verifyAdmin);
AdminRouter.get("/user", getAllUsers);
AdminRouter.get("/user/:userId", getUser);
AdminRouter.get("/user/domain/:domain", getUserByDomain);

AdminRouter.get("/whitelist", getWhitelistedUsers);
AdminRouter.post("/whitelist", addWhitelistedUsers);
AdminRouter.delete("/whitelist/:whitelistId", removeWhitelistedUsers);

AdminRouter.get("/domain", getAllDomains);
AdminRouter.get("/domain/:domainId", getDomain);
AdminRouter.post("/domain", addDomain);
AdminRouter.put("/domain/:domainId", updateDomain);
AdminRouter.delete("/domain/:domainId", removeDomain);

AdminRouter.get("/questionnaire/", getAllQuestionnaire);
AdminRouter.post("/questionnaire/:domainId", addQuestionnaire);
AdminRouter.put("/questionnaire/:questionnaireId", updateQuestionnaire);
AdminRouter.delete("/questionnaire/:questionnaireId", deleteQuestionnaire);

AdminRouter.get("/response", getResponse);

AdminRouter.put("/question/mcq/:questionId", updateMcqQuestion);
AdminRouter.put("/question/text/:questionId", updateTextQuestion);
AdminRouter.delete("/question/mcq/:questionId", deleteMcqQuestion);
AdminRouter.delete("/question/text/:questionId", deleteTextQuestion);

AdminRouter.get("/interview", getAllInterviews);
AdminRouter.get("/interview/:interviewId", getInterviewById);
AdminRouter.post("/interview", scheduleInterview);
AdminRouter.put("/interview/:interviewId", updateInterview);
AdminRouter.delete("/interview/:interviewId", cancelInterview);

AdminRouter.get("/task", getTask);
AdminRouter.post("/task", addTask);
AdminRouter.put("/task/:taskId", updateTask);
AdminRouter.delete("/task/:taskId", deleteTask);

AdminRouter.get("/submission", getAllSubmission);

