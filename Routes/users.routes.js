import express from 'express';
import { getAllUsers, register } from '../Controllers/users.controller.js';

const router = express.Router();


router.get('/', getAllUsers)
router.post('/', register)


export default router