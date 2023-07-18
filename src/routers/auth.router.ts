import { Router } from "express";
import { Login, Register } from "../controllers/auth.controller";
import {
  mwValidateLoginData,
  mwValidateUserData,
} from "../middlewares/userDataValidator";
import { limiter, signInLimiter } from "../middlewares/rate-limiter";
const authRouter = Router();

authRouter.post(
  "/login",
  signInLimiter,
  (req, res, next) => {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.description = 'Endpoint to authenticate All logins'
     */

    /* #swagger.requestBody = {
			content: {
				"application/json": {
					schema: {$ref: "#/definitions/LoginData"}
				}
			}
		}*/
    next();
  },
  mwValidateLoginData,
  Login
);

export default authRouter;
