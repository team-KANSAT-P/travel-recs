import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';


import { parseUserQuery } from './controllers/userQueryController.js';
import {
  getPlacesBySearchText,
  filterPlacesByUserQuery,
} from './controllers/googlePlacesApi.js';
// import { openAIRecommendationResponse } from './controllers/openaiRecommendation.ts';

import { queryOpenAIChat as parseNLPQuery } from './controllers/openaiNLPQuery.ts';

import 'dotenv/config';

const app = express();
const port = Number(process.env.port) || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.resolve(import.meta.dirname, '../client/assets')));

app.get('/', (_req: Request, res: Response) => {
  return res
    .status(200)
    .sendFile(path.resolve(import.meta.dirname, '../client/index.html'));
});

app.post(
  '/api/recommendations',
  parseUserQuery,
  parseNLPQuery,
  getPlacesBySearchText,
  filterPlacesByUserQuery,
  // openAIRecommendationResponse,
  // logger?
  (_req, res) => {
    res.status(200).json(res.locals.localRecommendation);
  },
);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The route ${req.originalUrl} does not exist`,
  });
});

/**
 * Global Error Handler
 * @middleware
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const DEFAULT_ERROR = {
    log: 'An Unknown Middleware Error Occurred',
    status: 500,
    message: {
      err: 'A Server Error Occured',
    },
  };
  const specificError = { ...DEFAULT_ERROR, ...err };
  console.error(specificError.log);
  res.status(specificError.status).json(specificError.message);
});

app.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});
