import { Router } from "express";
import {
  acceptParticipantByPhone,
  addNoteToParticipant,
  addParticipant,
  bulkEmailParticipants,
  deleteParticipantByEmail,
  deleteParticipantByPhone,
  emailParticipantByPhone,
  getAllParticipants,
  rejectParticipantByPhone,
  updateParticipantByPhone,
  updateParticipantStatus,
} from "../controllers/participant.controller";
import {
  mwValidateParticipant,
  mwValidateStatus,
} from "../middlewares/participants/participant.validation.middleware";
import isLoggedIn from "../middlewares/authentication/login.middleware";
import giveAccessTo from "../middlewares/authentication/giveAccessTo.middleware";
import { limiter } from "../middlewares/rate-limiter";

const participantRouter = Router();

participantRouter
  .use(limiter)
  .get("/getAll", isLoggedIn, giveAccessTo("member"), getAllParticipants)
  .post("/add", mwValidateParticipant, addParticipant)
  .patch("/update", isLoggedIn, giveAccessTo("hr"), updateParticipantByPhone)
  .delete(
    "/delete",
    isLoggedIn,
    giveAccessTo("admin"),
    deleteParticipantByPhone
  )
  .post("/email", isLoggedIn, giveAccessTo("admin"), bulkEmailParticipants)
  .patch(
    "/interview/note",
    isLoggedIn,
    giveAccessTo("hr"),
    addNoteToParticipant
  )
  .patch(
    "/status",
    isLoggedIn,
    giveAccessTo("hr"),
    mwValidateStatus,
    updateParticipantStatus
  );
export default participantRouter;
