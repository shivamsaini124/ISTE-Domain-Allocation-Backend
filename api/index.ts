import app from "../src/app";
import { connectToDatabase } from "../src/config/db";

let isConnected = false;

async function initDB() {
  if (!isConnected) {
    await connectToDatabase();
    isConnected = true;
  }
}

export default async function handler(req: any, res: any) {
  await initDB();
  return app(req, res);
}
