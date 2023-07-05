const router = require('express').Router();
const { createMovieValidation, removeMovieValidation } = require('../middlewares/validation');

const { getMovies, createMovie, removeMovie } = require('../controllers/movie');

router.get('/', getMovies);

router.post('/', createMovieValidation, createMovie);

router.delete('/:_id', removeMovieValidation, removeMovie);

module.exports = router;
