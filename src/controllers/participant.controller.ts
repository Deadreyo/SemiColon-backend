import { Request, Response } from "express";
import { participant as ParticipantType } from "../types/participant";
import mongoose from "mongoose";
import {
	dbGetParticipantByPhone,
	dbGetAllParticipants,
	dbUpsertParticipant,
	dbDeleteParticipant,
	dbUpdateParticipant,
} from "../models/participant/participant.model";
import ErrorWithStatusCode from "../utils/classes/ErrorWithStatusCode";
import { dbAddNewParticipantLog } from "../models/log/log.model";
import { sendBulkEmail, sendMail } from "../services/node-mailer";
import mailGen, { EmailTypeEnum } from "../utils/constructors/email.constructors";
import { Email } from "../types/email";
// import { Preference } from "../models/participant/participant.schema";
import { StatusEnum } from "../models/participant/participant.schema";
import { InterviewerObject, InterviewNotes } from "../types/interviewNote";
import { getChanges } from "../utils/diffing/getChanges.util";

//------------------------CRUD------------------------//
export async function getAllParticipants(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get all participants from database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */

	/* #swagger.responses[200] = {
			schema: {"$ref": "#/definitions/AllPars"},
			description: "All Participants data"
  }*/
	try {
		const participants = await dbGetAllParticipants();
		res.status(200).json({ status: "success", data: participants });
	} catch (error: ErrorWithStatusCode | any) {
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	}
}

export async function addParticipant(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get add a participant to database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	try {
		const { participant }: { participant: ParticipantType } = req.body;
		const newParticipant = await dbUpsertParticipant(participant);
		res.status(200).json({ status: "success" });
	} catch (error: ErrorWithStatusCode | any) {
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	}
}

export async function deleteParticipantByEmail(req: Request, res: Response) {
	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { email } = req.body;
		const deletedParticipant = await dbDeleteParticipant({ email }, session);
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "delete",
				target: deletedParticipant._id as string,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: deletedParticipant });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

export async function deleteParticipantByPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get delete a participant from database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { phone } = req.body;
		const deletedParticipant = await dbDeleteParticipant({ phone }, session);
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "delete",
				target: deletedParticipant._id as string,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: deletedParticipant });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

export async function updateParticipantByPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to update a participant in database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { update, phone }: { update: Partial<ParticipantType>; phone: string } = req.body;
		const originalParticipant = await dbUpdateParticipant(update, { phone }, session);
		const diff = getChanges(update, originalParticipant);
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

//------------------Emails------------------//

export async function bulkEmailParticipants(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to email a participant in database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const { type, preferences } = req.body;
	try {
		let EmailType = type as EmailTypeEnum;
		let participants = (await dbGetAllParticipants()) as ParticipantType[];
		if (preferences) {
			participants = participants.filter((participant) => preferences.includes(participant.firstPreference));
		}
		let emails: Email[] = mailGen[EmailType](participants);
		if (emails.length === 0 || !emails) {
			return res.status(400).json({
				status: "failure",
				data: "No emails to send",
			});
		}
		await sendBulkEmail(emails);
		res.status(200).json({
			status: "success",
			data: "Emails sent successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: "failure",
			data: (error as Error).message,
		});
	}
}

export async function acceptParticipantByPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get accept a participant from database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { phone }: { phone: string } = req.body;
		const originalParticipant = await dbUpdateParticipant(
			{ acceptanceStatus: StatusEnum.ACCEPTED },
			{ phone },
			session
		);
		const diff = {
			OLD: { acceptanceStatus: originalParticipant.acceptanceStatus },
			NEW: { acceptanceStatus: StatusEnum.ACCEPTED },
		};
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

export async function rejectParticipantByPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get reject a participant from database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { phone }: { phone: string } = req.body;
		const originalParticipant = await dbUpdateParticipant(
			{ acceptanceStatus: StatusEnum.REJECTED },
			{ phone },
			session
		);
		const diff = {
			OLD: { acceptanceStatus: originalParticipant.acceptanceStatus },
			NEW: { acceptanceStatus: StatusEnum.REJECTED },
		};
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

export async function emailParticipantByPhone(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to get send an email to a participant from database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { phone }: { phone: string } = req.body;
		//TODO: send email using nodemailer here
		const originalParticipant = await dbUpdateParticipant(
			{ acceptanceStatus: StatusEnum.EMAILED },
			{ phone },
			session
		);
		const diff = {
			OLD: { acceptanceStatus: originalParticipant.acceptanceStatus },
			NEW: { acceptanceStatus: StatusEnum.EMAILED },
		};
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

//------------------Status------------------//

export async function updateParticipantStatus(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to update a participant's status'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { status, phone }: { status: StatusEnum; phone: string } = req.body;
		const originalParticipant = await dbUpdateParticipant({ acceptanceStatus: status }, { phone }, session);
		const diff = {
			OLD: { acceptanceStatus: originalParticipant.acceptanceStatus },
			NEW: { acceptanceStatus: status },
		};
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error: ErrorWithStatusCode | any) {
		await session.abortTransaction();
		res.status(error.statusCode || 500).json({
			status: "failure",
			data: error.message,
		});
	} finally {
		session.endSession();
	}
}

export async function addNoteToParticipant(req: Request, res: Response) {
	/**
	 * #swagger.tags = ['Participants']
	 * #swagger.description = 'Endpoint to add a note to a participant in database'
	 */

	/* #swagger.security = [{
            "bearerAuth": []
    }] */
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { note, phone }: { note: InterviewNotes; phone: string } = req.body;
		const interviewNoteObj: InterviewerObject = {
			interviewNotes: note,
			interviewerId: req.user?._id,
			date: new Date(),
		};
		const originalParticipant = await dbUpdateParticipant({ InterviewerNote: interviewNoteObj }, { phone });
		const diff = {
			OLD: { InterviewerNote: originalParticipant.InterviewerNote },
			NEW: { InterviewerNote: interviewNoteObj },
		};
		await dbAddNewParticipantLog(
			{
				initiator: req.user?._id as string,
				action: "update",
				target: originalParticipant._id as string,
				previousState: diff.OLD as Partial<ParticipantType>,
				newState: diff.NEW as Partial<ParticipantType>,
			},
			session
		);
		await session.commitTransaction();
		res.status(200).json({ status: "success", data: diff });
	} catch (error) {
		await session.abortTransaction();
		console.log((error as Error).name);
		let errorStatusCode = (error as ErrorWithStatusCode).statusCode
			? (error as ErrorWithStatusCode).statusCode
			: (error as Error).name === "CastError"
			? 400
			: 500;
		res.status(errorStatusCode).json({
			status: "failure",
			data: (error as Error).message,
		});
	} finally {
		session.endSession();
	}
}
