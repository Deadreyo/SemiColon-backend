# SemiColon Backend

### This backend project is a feature intensive registration management system made to manage the participants admission for any event of any organization through the various features available in it and can be used through the provided API reference below

## Modules

### Participants

This module is responsible for managing participants in the system. The participants are the students who would attend the workshops provided by members of the student activity.

When the members announce a new workshop, the Forms generated to collect the data of the participants would send the data to this module.

-   Add New Participants
-   update Participants
-   Delete Participants
-   Add interviewer notes `set specific notes regarding the interview with specific participants rating each predefined skill by a rate from 1 to 5 and giving a comment about that rating`

### Users

This module is responsible for managing users and groups on the system. The users are the members of the student activity who would use the system to manage participants.

-   Add New users
-   Update Users
-   Activate Users
-   Deactivate Users

Users In this system are the members of the student activity, each user has a role in the system.
The roles are:

-   Admin
-   HR
-   Member

**Admin** has the highest privileges in the system, he can do anything in the system.

**HR** has the privileges to manage participants in the system.

**Member** has the privileges to only view the data of participants.

### Emails

This feature allows you to:

-   send templated bulk emails to participants and filter which one to send to by `track`, the sent template emails each change the participant status accordingly `ex: acceptance template email -> accepted status`.
-   send custom emails to a custom group of people changing their status into a custom status and may also not change status.

### Logs

This module is responsible for managing logs in the system. The logs are the actions that the users do in the system on participants or on each other.

-   Add New Logs
-   View Logs

### Authentication

This module is responsible for managing authentication in the system. The authentication is the process of verifying the identity of the users who would use the system. The authentication is implemented by using JWT.

-   Login
-   Sign up

## Technologies Used:

This system is built using MERN stack and some other technologies, the complete list of technologies used in this system is:

-   Node.js
-   Express.js
-   TypeScript
-   MongoDB
-   Passport.js
-   JWT
-   Jest
-   GitHub Actions
-   React.js
-   Swagger
-   Nodemailer

## References

For complete API reference for this system visit [this link](https://semicolon-registration-backend.onrender.com/)
