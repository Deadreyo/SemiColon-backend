const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Semicolon API",
  },
  basePath: "/",
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "User",
      description: "User Endpoints",
    },
    {
      name: "Auth",
      description: "Authentication Endpoints",
    },
    {
      name: "Participants",
      description: "Participants Endpoints",
    },
    {
      name: "Log",
      description: "Log Endpoints",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  definitions: {
    User: {
      $username: "Ahmed Atwa",
      $role: "admin",
      $token: "xxxxxxx",
    },
    Participant: {
      $_id: "xxxxx",
      $name: "Omar Fahmy",
      $email: "Omar_Fahmy@gmail.com",
      $phone: "01xxxxxxxxx",
      $firstPreference: "Web Development (ReactJS)",
      $secondPreference: "Web Development (NodeJS)",
      $firstPrefReason: "",
      $firstPrefKnowledge: "",
      $secondPrefReason: "",
      $pastExperience: "",
      $collegeId: "18xxxxx",
      $year: "Junior",
      $acceptanceStatus: "accepted",
      $emailedStatus: "true",
    },
    Log: {
      $adminId: "",
      $adminPhone: "01xxxxxxxxx",
      $participantId: "",
      $action: "add",
    },
    LoginData: {
      $phone: "01xxxxxxxxx",
      $password: "********",
    },
    Responses: {
      $status: "success",
      $data: {
        $ref: "#/definitions/User"
      }
    },
    AllPars: {
      $status: "success",
      $data: [{
        $ref: "#/definitions/Participant"
      }]
    },
    AllUsers: {
      $status: "success",
      $data: [{
        $ref: "#/definitions/User"
      }]
    }
  },
  servers: [
    {
      url: "https://semicolon-registration-backend.onrender.com/",
    },
  ],
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./api.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
//https://blog.logrocket.com/documenting-express-js-api-swagger/
//https://github.com/davibaltar/example-swagger-autogen-with-router/tree/main
