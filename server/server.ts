/**
 * @file server.ts
 * @description This file sets up and configures an Express server for the travel recommendations application.
 * It includes middleware for parsing cookies, JSON, URL-encoded data, and handling CORS.
 * It also serves static files and defines routes for handling recommendations and errors.
 * The main route is a POST request to `/api/recommendations`,
 *    which takes a user query and returns a markdown formated response with travel recommendations.
 *
 * @module server
 */

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';


import { parseUserQuery } from './controllers/userQueryController.js';
import {
  getPlacesBySearchText,
  filterPlacesByUserQuery,
} from './controllers/googlePlacesApi.js';

import { queryOpenAIChat as parseNLPQuery } from './controllers/openaiNLPQuery.ts';

import 'dotenv/config';

const app = express();
const port = Number(process.env.port) || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.resolve(import.meta.dirname, '../client/assets')));

/**
 * Route serving the main HTML file.
 * @name get/
 * @function
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} Sends the index.html file
 */
app.get('/', (_req: Request, res: Response) => {
  return res
    .status(200)
    .sendFile(path.resolve(import.meta.dirname, '../client/index.html'));
});

/**
 * Route handling recommendations.
 * @name post/api/recommendations
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} Sends the local recommendation as JSON
 */
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

/**
 * Middleware to handle 404 Not Found errors.
 * @function
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} Sends a 404 error JSON response
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The route ${req.originalUrl} does not exist`,
  });
});

/**
 * Global Error Handler
 * @middleware
 * @function
 * @param {Error} err - Error object
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next middleware function
 * @returns {Response} Sends a JSON response with the error message
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

/**
 * Starts the server and listens on the specified port.
 * @function
 * @param {number} port - The port number to listen on
 */
app.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});
