import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "../auth/passport.js";

import apiRoutes from "../routes/index.route.js";

import notFound from "../middleware/notFound.js";
import errorHandler from "../middleware/errorHandler.js";



const app = express();
app.use(cookieParser());

app.use(passport.initialize());


app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount all API routes under /api
app.use("/api", apiRoutes);

// Handle unknown routes
app.use(notFound);

// Handle unexpected errors
app.use(errorHandler);



export default app;

