const Movie = require('../models/movie');
const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const СredentialError = require('../utils/errors/СredentialError');

function getMovies(req, res, next) {
  Movie.find({})
    .then((movies) => res.send({ movies }))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданны некорректные данные при добавлении фильма'));
      }
      return next(err);
    });
}

function removeMovie(req, res, next) {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Запрашиваемый фильм не найден');
      }
      if (movie.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(req.params._id)
          .then(() => res.send({ movie }))
          .catch((err) => {
            if (err.name === 'CastError') {
              return next(new ValidationError('Переданны некорректные данные при удалении фильма'));
            }
            return next(err);
          });
      } else {
        throw new СredentialError('Недостаточно прав');
      }
    })
    .catch(next);
}

module.exports = { getMovies, createMovie, removeMovie };
