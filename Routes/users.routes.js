import express from 'express';
import { authUser, getAllUsers, login, logout, register } from '../Controllers/users.controller.js';

const router = express.Router();


router.get('/', getAllUsers)
router.get('/check', authUser)
router.get('/logout', logout)
router.post('/register', register)
router.post('/login', login)


export default router