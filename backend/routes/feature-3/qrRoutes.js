import express from 'express';
import { handleNewMember, getMemberQR } from '../../controllers/feature-3/qrController.js';

const router = express.Router();

router.post('/webhook/new-member', handleNewMember);
router.get('/:memberId/:communityId', getMemberQR);

export default router;