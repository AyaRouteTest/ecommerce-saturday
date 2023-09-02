import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./DB/connection.js";
import { appRouter } from "./src/app.router.js";
dotenv.config();
const app = express();
const port = process.env.PORT;

connectDB();
appRouter(app, express);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
