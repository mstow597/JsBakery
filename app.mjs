import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { AppError } from './utils/appError.mjs';
import globalErrorHandler from './controllers/errorController.mjs';
import userRouter from './routes/userRouter.mjs';

const limiter = rateLimit({
  windowMS: 10 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again later!',
});

const app = express();

app.use(helmet()); // security
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // development logging
app.use(express.json({ limit: '10kb' })); // body parser - reading data from body and putting into req.body as JSON - limit for DDOS protection
app.use(mongoSanitize()); // data sanitization against NoSQL query injection
app.use(xss()); // data sanitization against XSS attacks (cross site scripting)
app.use(hpp({ whitelist: [''] })); // TODO: Add whitelist options for parameters allowed for duplication in URL query string
app.use('/api', limiter);
app.use('/api/v1/users', userRouter);
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/orders', orderRoute);
app.use('*', (req, res, next) => next(new AppError(`Can't find ${req.originalUrl}`, 404)));
app.use(globalErrorHandler);

export default app;
