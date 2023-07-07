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

authRouter.use(limiter);

authRouter.post(
  "/register",
  (req, res, next) => {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.description = 'Endpoint to authenticate All registers'
     */
    next();
  },
  mwValidateUserData,
  Register
);

export default authRouter;
