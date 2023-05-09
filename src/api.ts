import express from "express";
import passport from "passport";
import cookieSession from "./services/cookie-session";
import { serve, setup } from "swagger-ui-express";
import globalRouter from "./routers/global.router";
import "./services/passport";
import cors from "./middlewares/security/cors.middleware";
const swaggerDoc = require("./swagger_output.json");

const api = express();

api.use(express.json());
api.use(cookieSession);
api.use(passport.initialize());
api.use(passport.session());
api.use(cors);
api.use("/doc", serve, setup(swaggerDoc, {swaggerUrl: process.env.PORT}));
api.use("/", globalRouter);

export default api;
