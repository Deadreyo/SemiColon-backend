import mongoose from "mongoose";
import { participant as ParticipantType } from "../../types/participant";

export const participantSchema = new mongoose.Schema<ParticipantType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    phone: {
      type: String,
      required: true,
      match: /^01\d{9}$/,
    },
    firstPreference: {
      type: String,
      required: true,
      enum: ["webDev1", "webDev2", "WebDev3"],
    },
    secondPreference: {
      type: String,
      required: true,
      enum: ["webDev1", "webDev2", "WebDev3"],
    },
    firstPrefReason: {
      type: String,
      required: true,
    },
    firstPrefKnowledge: {
      type: String,
      required: true,
    },
    secondPrefReason: {
      type: String,
      required: true,
    },
    pastExperience: {
      type: String,
      required: true,
      collegeId: {
        type: String,
        required: true,
      },
      year: {
        type: String,
        required: true,
        enum: ["Freshman", "Sophomore", "Junior", "Senior 1", "Senior 2"],
      },
      acceptanceStatus: {
        type: String,
        required: true,
        default: "pending",
        enum: ["accepted", "rejected", "pending"],
      },
      emailedStatus: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const Participant = mongoose.model<ParticipantType>(
  "Participant",
  participantSchema
);

export default Participant;