const express = require('express');
const authRouter = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const validateSignup = [
  check('userName').not().isEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Valid email required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

authRouter.post('/signup', validateSignup, authController.signup);
authRouter.post('/login', authController.login);
authRouter.post('/fetchAllUserData', authController.usersDeatils);

module.exports = authRouter;