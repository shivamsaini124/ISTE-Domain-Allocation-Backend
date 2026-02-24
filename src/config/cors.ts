import type { CorsOptions } from 'cors';
import dotenv from 'dotenv';

//Evironemnet variables
dotenv.config();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '';
const NODE_ENV = process.env.NODE_ENV || 'prod';

const allowedOrigins = ALLOWED_ORIGINS
  ? ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3000',
    ];

//Cors options
export const corsOptions: CorsOptions = {
  origin:  
  function (origin, callback) {
    if(!origin){
        if(NODE_ENV === 'dev') return callback(null, true);
        else return callback(new Error('Not allowed by CORS'));
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};