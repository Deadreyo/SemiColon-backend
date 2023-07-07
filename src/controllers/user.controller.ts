import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  dbAddNewUser,
  dbDeleteUserById,
  dbGetUserById,
  dbGetUserByPhone,
  dbUpdateUserById,
  dbActivateUserById,
  dbDeactivateUserById,
  dbGetAllUsers,
} from "../models/user/user.model";
import ErrorWithStatusCode from "../utils/classes/ErrorWithStatusCode";
import { dbAddNewUserLog } from "../models/log/log.model";
import { getChanges } from "../utils/diffing/getChanges.util";
import UserType from "../types/user";

export async function getUserById(req: Request, res: Response) {
  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const { id } = req.params;
  try {
    const user = await dbGetUserById(id);
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error: unknown) {
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as ErrorWithStatusCode).message,
    });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to get all users'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */

	/* #swagger.responses[200] = {
			schema: {"$ref": "#/definitions/AllUsers"},
			description: "All users data"
  }*/
  try {
    const users = await dbGetAllUsers();
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error: unknown) {
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  }
}

export async function getUserByPhone(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to get a specific user by phone number'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */

  /* #swagger.responses[200] = {
			schema: {"$ref": "#/definitions/User"},
			description: "User data"
  }*/
  const { phone } = req.params;
  try {
    const user = await dbGetUserByPhone(phone);
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error: unknown) {
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  }
}

export async function addNewUser(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to get add a new user'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const user = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newUser = await dbAddNewUser(user, session);
    await dbAddNewUserLog(
      {
        initiator: req.user?._id as string,
        target: newUser._id as string,
        action: "add",
      },
      session
    );
    await session.commitTransaction();
    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}

export async function updateUser(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to update a user using his ID'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const { id } = req.params;
  const user = req.body as Partial<UserType>;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const originalUser = await dbUpdateUserById(id, user, session);
    const diff = getChanges(user, originalUser);
    await dbAddNewUserLog(
      {
        initiator: req.user?._id as string,
        target: originalUser._id as string,
        action: "update",
        previousState: diff.OLD,
        newState: diff.NEW,
      },
      session
    );
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      data: diff,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}

export async function deleteUser(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to delete a specific user'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const session = await mongoose.startSession();
  session.startTransaction();
  const { id } = req.params;
  try {
    const deletedUser = await dbDeleteUserById(id, session);
    await dbAddNewUserLog(
      {
        initiator: req.user?._id as string,
        target: deletedUser._id as string,
        action: "delete",
      },
      session
    );
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      data: deletedUser,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}

export async function activateUser(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to activate a specific user using his ID'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const session = await mongoose.startSession();
  session.startTransaction();
  const { id } = req.params;
  try {
    const activatedUser = await dbActivateUserById(id, session);
    await dbAddNewUserLog(
      {
        initiator: req.user?._id as string,
        target: activatedUser._id as string,
        action: "activate",
      },
      session
    );
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      data: activatedUser,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}

export async function deactivateUser(req: Request, res: Response) {
  /**
   * #swagger.tags = ['User']
   * #swagger.description = 'Endpoint to deactivate a specific user using his ID'
   */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const session = await mongoose.startSession();
  session.startTransaction();
  const { id } = req.params;
  try {
    const deactivatedUser = await dbDeactivateUserById(id, session);
    await dbAddNewUserLog(
      {
        initiator: req.user?._id as string,
        target: deactivatedUser._id as string,
        action: "deactivate",
      },
      session
    );
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      data: deactivatedUser,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    res.status((error as ErrorWithStatusCode).statusCode || 500).json({
      status: "failure",
      data: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}
