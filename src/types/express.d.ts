import type {UserInterface} from '../types/user';

declare global {
    namespace Express {
        interface Request {
            user?: UserInterface;
        }
    }
}

export {};