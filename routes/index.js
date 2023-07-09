const router = require('express').Router();

const { createUser, login, signout } = require('../controllers/user');
const { signUpValidation, signInValidation } = require('../middlewares/validation');
const { auth } = require('../middlewares/auth');
const NotFoundError = require('../utils/errors/NotFoundError');

router.post('/signin', signInValidation, login);
router.post('/signup', signUpValidation, createUser);
router.use(auth);
router.post('/signout', signout);

router.use('/users', require('./user'));
router.use('/movies', require('./movie'));

router.use((req, res, next) => {
  next(new NotFoundError('Страницы не существует'));
});

module.exports = router;
