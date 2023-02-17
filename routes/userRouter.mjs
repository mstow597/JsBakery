import express from 'express';
import { signup } from '../controllers/authController.mjs';

const router = express.Router();
router.route('/signup').post(signup);

export default router;
