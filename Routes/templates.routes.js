import express from 'express'
import { getAllTemplates } from '../Controllers/templates.controller.js';

const router = express.Router();


router.get('/', getAllTemplates)


export default router;