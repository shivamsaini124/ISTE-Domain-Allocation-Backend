//Import all the modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import type {NextFunction, Request, Response} from 'express';

import {corsOptions} from './config/cors.js';
import {connectToDatabase} from './config/db.js';
import {verifyFirebaseToken} from './middlewares/firebase.js';
import { apiKeyMiddleware } from './middlewares/apiKey.js';

//Importing all models here

//Evironemnet variables
dotenv.config();
const PORT = process.env.PORT || '3000';

const app = express();
app.set('trust proxy', 1);

//Middlewares
app.use(express.json());
app.use(cors(corsOptions));

//Add routers here


//Test Route
app.get('/health', apiKeyMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

app.get('/secured', apiKeyMiddleware, verifyFirebaseToken, (req: Request, res: Response) => {
  console.log('User Info:', req.user);
  res.status(200).json({ status: 'OK', message: 'Secured API is healthy' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});


//Start Server
async function startServer(): Promise<void> {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log('Failed to start server!!!');
    console.error(err);
  }
}
startServer();

