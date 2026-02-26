import express from 'express';
import {getLogsByMember} from "../../controllers/engergy-poverty-support/SupportActionLogController"

const router = express.Router();

router.get("/member/:memberId", getLogsByMember);

export default router;