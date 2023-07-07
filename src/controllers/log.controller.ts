import { Request, Response } from "express";
import {
	dbGetAllUserLogs,
	dbGetAllParticipantLogs,
	dbGetLogsByAdminId,
	dbGetLogsByParticipantId,
} from "../models/log/log.model";
import ErrorWithStatusCode from "../utils/classes/ErrorWithStatusCode";

export async function getAllLogs(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Log']
	 * #swagger.description = 'Endpoint to get all logs by all admins'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	try {
		const userLogs = await dbGetAllUserLogs();
		const participantLogs = await dbGetAllParticipantLogs();
		res.status(200).json({
			status: "success",
			data: { userLogs, participantLogs },
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			message: (error as Error).message,
		});
	}
}

export async function getLogsByAdminId(req: Request, res: Response) {
	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	try {
		const adminId = req.params.id;
		const logs = await dbGetLogsByAdminId(adminId);
		res.status(200).json({
			status: "success",
			data: logs,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			message: (error as Error).message,
		});
	}
}

export async function getLogsByParticipantId(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Log']
	 * #swagger.description = 'Endpoint to get all logs applied on a participant'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	try {
		const participantId = req.params.id;
		const logs = await dbGetLogsByParticipantId(participantId);
		res.status(200).json({
			status: "success",
			data: logs,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			message: (error as Error).message,
		});
	}
}

export async function getLogsByAdminPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Log']
	 * #swagger.description = 'Endpoint to get all logs by an admin using their phone'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	try {
		const adminPhone = req.params.phone;
		const logs = await dbGetLogsByAdminId(adminPhone);
		res.status(200).json({
			status: "success",
			data: logs,
		});
	} catch (error: unknown) {
		res.status((error as ErrorWithStatusCode).statusCode || 500).json({
			status: "failure",
			message: (error as Error).message,
		});
	}
}
