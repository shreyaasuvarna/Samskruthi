import express from 'express';
import { getDoubts, createDoubt, getUnassignedDoubts, acceptDoubt } from '../controllers/doubtController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDoubts);
router.get('/unassigned', getUnassignedDoubts);
router.post('/', createDoubt);
router.put('/:id/accept', acceptDoubt);

export default router;
