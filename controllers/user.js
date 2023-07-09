const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../utils/errors/NotFoundError');
const ValidationError = require('../utils/errors/ValidationError');
const DataMatchError = require('../utils/errors/DataMatchError');
const AuthError = require('../utils/errors/AuthError');

function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Передано некорректное значение id пользователя'));
      }
      return next(err);
    });
}

function updateUserData(req, res, next) {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданны некорректные данные при редактировании пользователя'));
      }
      return next(err);
    });
}

function createUser(req, res, next) {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name, email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданны некорректные данные при создании пользователя'));
      }
      if (err.code === 11000) {
        return next(new DataMatchError('Почта уже занята'));
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentals(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, process.env.NODE_ENV !== 'production' ? 'secret_key' : process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true,
      });
      res.send({ _id: user._id });
    })
    .catch(next);
}

function signout(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    throw new AuthError('Необходима авторизация');
  }
  res.clearCookie('jwt');
  res.status(200).send({ message: 'Успешно' });
  next();
}

module.exports = {
  getCurrentUser, updateUserData, createUser, login, signout,
};
