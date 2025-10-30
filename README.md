# Next chat app API

The Next Chat App API is a `RESTful API` built with Express.js that provides the backend services for handling user interactions, messaging, and real-time communication with `socket.io`.

## Installation

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.

### Steps to install

1. Clone the repository:

   ```bash
   git clone https://github.com/mdlimon0175/next_chat_app_api.git
   cd form-builder

2. Add the environment variables to a `.env` file. You can either rename the `.env.example` file to `.env` or create a new `.env` file and add the necessary environment variables.

3. Install the dependencies:
If you're using npm:
   ```bash
   npm install
   ```

   Or if you're using yarn:
   ```bash
   yarn install
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   Or if you're using yarn:
   ```bash
   yarn start
   ```

## Tips
You can run npm start db:seed for first time to generate demo users and conversations.

## Usage 

By default, the server runs at `http://localhost:8000` if no port number is specified in the `.env` file.
All API routes can be accessed via the prefix `/api` endpoint.

### Routes
All routes, except for the login and registration routes, are private and secured with a JWT token. The token must be included in the request header as a Bearer token for authentication.

Here, all endpoint response json object with - \
`{status: boolean, message: string, data: null|array|object, error: null|object}`

#### Available routes
POST /login \
POST /register \
- Required fields: ` {username: string, email: string, password: string, password_confirmation: string} `

GET /logout \
GET /token_user \
GET /users/:search - `search: email or username` \
PUT /users/:user_id/change_profile_info \
- Required fields: ` {username: string, email: string, password: string, password_confirmation: string} `


GET /conversations \
GET /conversations/:conversation_id \
POST /conversations \
- Required fields: ` {receiver_id: string (ObjectId), message: string} ` \
- on success `add_conversation` socket event emitted to both sender and receiver.

GET /messages/c/:conversation_id \
POST /messages/c/:conversation_id \
- Required fields: ` {receiver_id: string (ObjectId), message: string} ` \
- on success `add_message` socket event emitted to both sender and receiver.

#### Available Socket Listeners

Here, all emit event send a object with - \
` {status: boolean, message: string, data: null|object, error: null|object} `

#### `auth_checker` 
Receives a token string and emits a socket event. If the token is verified, an `auth_success` event is emitted; otherwise, an `auth_failed` event is emitted.

### Call events
- If request is invalid, emit `call_error`.

#### `call_outgoing`
Receives a `room_id (conversation_id)` and emits a single event based on the status of the active call and the callee's availability:
- If an existing call is found, emit `rejoin_exist_call`.
- If callee on an existing call, emit `call_end`.
- If the callee’s socket is not active, emit `call_end`.
- If the callee declines or rejects the call, emit `call_end`.
- If the callee accepts the call, emit `call_data` with the call information.

#### `call_joined`
Receives `{ caller_id, call_id }` and emits a single event based on request data. \
After `call_ongoing` successful event, callee emit on `call_joined` to inform caller that callee joined the call.
- If call status is active, it's check caller socket is active or not and based on this emit `call_data` or `call_end`. and emit `rejoin_exist_call` for caller.
- If call status is not active, then emit an event for caller `callee_joined`.


#### `call_offer_sdp`
Receives ` {room_id, offer, rejoin: boolean} ` and emits a single event based on request data.
- If request.rejoin true check callee socket active or not. if not active emit `call_end` else emit `call_data`.
- Finally emit an event for callee with `caller_offer_sdp` or `caller_rejoin_offer_sdp` and on callback received a `answer` from callee and emit socket `callee_answer_sdp` with answer to caller.
- data.offer and data.answer included the offer or answer.

#### `call_hangup`
Receives `call_id`.
- emit `call_end` for room_id.

#### `ice_candidate`
Receives ` {room_id, call_id, candidate} ` and emits a single event based on request data. Help to change ice_candidate.
- emit `ice_candidate` and data.candidate includes the candidate information.

#### `call_toggle_stream`
Receives ` {stream_type: 'video'|'audio', stream_status: boolean, call_id, room_id} ` help to inform partner about stream toggle status.
- emit `call_remote_video_stream_toggled` or `call_remote_audio_stream_toggled` based on stream_type and data.status have the stream_status value.


## Contact Information
- **Email**: [mdlimon0175@gmail.com](mailto:mdlimon0175@gmail.com)
- **WhatsApp**: [+8801568113207](https://wa.me/8801568113207)
- **Facebook**: [fb.com/mdlimon0175](https://fb.com/mdlimon0175)