import { Router } from 'express';
import * as cmsController from '../controllers/cmsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/pages', cmsController.getPages);
router.get('/pages/:slug', cmsController.getPage);
router.post('/pages', authenticate, authorize('ADMIN', 'MANAGER'), cmsController.createPage);
router.put('/pages/:id', authenticate, authorize('ADMIN', 'MANAGER'), cmsController.updatePage);
router.delete('/pages/:id', authenticate, authorize('ADMIN'), cmsController.deletePage);

export default router;
