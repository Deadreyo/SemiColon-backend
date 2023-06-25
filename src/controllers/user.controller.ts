import { Request, Response } from "express";

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
import { diffObjects } from "../utils/diffing/objectDiff.util";

export async function getUserById(req: Request, res: Response) {
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
	const user = req.body;
	try {
		const newUser = await dbAddNewUser(user);
		await dbAddNewUserLog({
			initiator: req.user?._id as string,
			target: newUser._id as string,
			action: "add",
		});
		res.status(201).json({
			status: "success",
			data: newUser,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}

export async function updateUser(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['User']
	 * #swagger.description = 'Endpoint to update a user using his ID'
	 */
	const { id } = req.params;
	const user = req.body;
	try {
		const originalUser = await dbGetUserById(id);
		const updatedUser = await dbUpdateUserById(id, user);
		const diff = diffObjects(originalUser, updatedUser);
		await dbAddNewUserLog({
			initiator: req.user?._id as string,
			target: updatedUser._id as string,
			action: "update",
			previousState: diff.OLD,
			newState: diff.NEW,
		});
		res.status(200).json({
			status: "success",
			data: updatedUser,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}

export async function deleteUser(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['User']
	 * #swagger.description = 'Endpoint to delete a specific user'
	 */
	const { id } = req.params;
	try {
		const deletedUser = await dbDeleteUserById(id);
		await dbAddNewUserLog({
			initiator: req.user?._id as string,
			target: deletedUser._id as string,
			action: "delete",
		});
		res.status(200).json({
			status: "success",
			data: deletedUser,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}

export async function activateUser(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['User']
	 * #swagger.description = 'Endpoint to activate a specific user using his ID'
	 */
	const { id } = req.params;
	try {
		const activatedUser = await dbActivateUserById(id);
		dbAddNewUserLog({
			initiator: req.user?._id as string,
			target: activatedUser._id as string,
			action: "activate",
		});
		res.status(200).json({
			status: "success",
			data: activatedUser,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}

export async function deactivateUser(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['User']
	 * #swagger.description = 'Endpoint to deactivate a specific user using his ID'
	 */
	const { id } = req.params;
	try {
		const deactivatedUser = await dbDeactivateUserById(id);
		dbAddNewUserLog({
			initiator: req.user?._id as string,
			target: deactivatedUser._id as string,
			action: "deactivate",
		});
		res.status(200).json({
			status: "success",
			data: deactivatedUser,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}
