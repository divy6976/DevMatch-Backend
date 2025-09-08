# DevTinder API Endpoints

## Auth Router
Handles user authentication, including signup, login, and logout.

POST /signup: Register a new user.
POST /login: Authenticate a user and issue a token.
POST /logout: Revoke the user's session.




## Profile Router
Manages user profile-related operations.

GET /profile/view: Retrieve the profile information of the logged-in user.
PATCH /profile/edit: Update user profile details.
PATCH /profile/password: Change the user's password.



## Connection Request Router
Handles connection requests between users with various statuses:
POST /request/send/:status/:touserId:
POST /request/review/:status/:requestId:


Endpoints:
POST /request/send/intrested/:touserId: Send a connection request to another user.
POST /request/send/ignored/:touserId: Mark a request as ignored.
POST /request/review/accepted/:requestId: Accept a connection request.
POST /request/review/rejected/:requestId: Reject a connection request.


## User Router
Handles operations related to connections, requests, and the user feed.

GET /user/connections: Get a list of connections for the logged-in user.
GET /user/requests/received: Retrieve a list of received connection requests.
GET /user/feed: Get a list of suggested users to connect with.



Status Options: ignore, interested, accepted, rejected.






  Get the requestId from the URL.

Fetch the request from the database using that ID.

Get details like: senderId, receiverId, status, etc.

Get the currently logged-in user's ID (e.g., from token/session).

Check if logged-in user is the receiver of the request:

If loggedInUserId != request.receiverId, reject the request (403 Forbidden).

Check if the current status of the request is already accepted/rejected:

If yes, return an error (e.g., "Request already reviewed").

Check if the new status passed is valid (e.g., accepted, rejected).

If not, return a validation error.

If all checks pass:

Update the request with the new status.

Optionally add comment, reviewedBy, reviewedAt, etc.

(Optional) If status is "accepted":

Trigger any business logic like sending notification, starting next step, etc.

Save the updated request to the database.

Return a success response.