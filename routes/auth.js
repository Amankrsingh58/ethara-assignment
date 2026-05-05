const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);

module.exports = router;
