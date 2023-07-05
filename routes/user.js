const router = require('express').Router();

const { getCurrentUser, updateUserData } = require('../controllers/user');
const { updateUserDataValidation } = require('../middlewares/validation');

router.get('/me', getCurrentUser);

router.patch('/me', updateUserDataValidation, updateUserData);

module.exports = router;
