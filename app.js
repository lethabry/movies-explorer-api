require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');

const router = require('./routes/index');
const centralErrorHandler = require('./middlewares/centralErrorHandler');
const checkAccessCors = require('./middlewares/cors');
const limiter = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAccessCors);

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb');

app.use(helmet());
app.use(limiter);
app.use(requestLogger);

app.use(router);

app.use(errorLogger);
app.use(errors());
app.use(centralErrorHandler);

app.listen(PORT);
