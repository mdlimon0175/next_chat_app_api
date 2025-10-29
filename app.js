/*
// Title: Chat APP API
// Description: Secure and efficient chat app API for real-time communication, designed with scalability and performance in mind.
// Author: Kiam Khan Limon
// Author email: mdlimon0175@gmail.com
// version: 1.0
// Date: 06/13/25
*/

const express = require('express');
const { join } = require('path');
const cors = require('cors');
const { default: helmet } = require('helmet');

const { privateRouter, publicRouter } = require('./routes/api');
const { globalRateLimit } = require('./http/middleware/rateLimitMiddleware');
const { errorHandler, notFoundHandler } = require('./http/middleware/errorMiddleware');

// create express app
const app = express();
app.disable('x-powered-by');

// app middleware
app.use(helmet());
app.use('/api', cors({
    origin: '*'
}));

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use(globalRateLimit);
app.use('/api', publicRouter);
app.use('/api', privateRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;