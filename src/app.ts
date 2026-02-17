//Import all the modules
import express from 'express';
import cors from 'cors';

import type {NextFunction, Request, Response} from 'express';

import {corsOptions} from './config/cors';
import {verifyFirebaseToken} from './middlewares/firebase';
import {apiKeyMiddleware} from './middlewares/apiKey';
import {verifyAdmin} from './middlewares/admin';
import {verifyUser} from './middlewares/user';
import { UserRouter } from './routes/user/user';
import { AdminRouter } from './routes/admin/admin';

const app = express();
app.set('trust proxy', 1);

//Middlewares
app.use(express.json());
app.use(cors(corsOptions));

//Add routers here
app.use(apiKeyMiddleware);
app.use('/user', UserRouter);
app.use('/admin', AdminRouter);


//Test Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

app.get('/secured/user', verifyFirebaseToken, verifyUser, (req: Request, res: Response) => {
  console.log('User Info:', req.user);
  res.status(200).json({ status: 'OK', message: 'Secured API is healthy' });
});

app.get('/secured/admin', verifyFirebaseToken, verifyAdmin, (req: Request, res: Response) => {
  console.log('Admin Info:', req.user);
  res.status(200).json({ status: 'OK', message: 'Secured Admin API is healthy' });
});


// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

//Global Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});


export default app;
