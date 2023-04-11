<h1 align="center">Imagist - A Pinterest Clone</h1>

<p align="center">
  <img src="https://i.imgur.com/rwtPdKj.png" alt="Imagist screenshot">
</p>

<p align="center">
  Imagist is a clone of Pinterest that allows users to create an account, sign in with Google, create pins, save pins, delete their pins, comment on pins, create boards, save pins to boards, search for pins, change their profile picture, and download pins. It is built using EJS as frontend CSS for styling and Node.js as the backend. Pins are stored using GridFS in a MongoDB database and are directly fetched from the database.
</p>

## Getting Started

To get a local copy of this project up and running, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/try/download/community)



## Installation

1. Clone the repository:
git clone https://github.com/your-username/imagist.git

2. Install the dependencies:
   - cd imagist
   - npm install

3. Set up the environment variables:

Create a file named `.env` in the root directory of the project and add the following variables:

PORT=3000
MONGO_URI=<your-mongodb-uri>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SESSION_SECRET=<your-session-secret>

Replace `<your-mongodb-uri>`, `<your-google-client-id>`, `<your-google-client-secret>`, and `<your-session-secret>` with your own values.

4. Run the application:

npm start

The application should now be running on http://localhost:3000/.


## Usage

### Create an account

Click on the "Sign up" button and fill in the registration form with your name, email, and password. Click on the "Sign up" button to create your account.

### Sign in with Google

Click on the "Sign in with Google" button and choose the Google account you want to use to sign in.

### Create a pin

Click on the "Create Pin" button and fill in the pin form with the pin title, description, and image. Click on the "Create Pin" button to create your pin.

### Save a pin

Hover over a pin and click on the "Save" button to save the pin to one of your boards.

### Delete a pin

Hover over a pin you have created and click on the "Delete" button to delete the pin.

### Comment on a pin

Click on a pin to view it and scroll down to the comments section. Type in your comment and click on the "Post" button to post your comment.

### Create a board

Click on the "Create Board" button and fill in the board form with the board name and description. Click on the "Create Board" button to create your board.

### Save a pin to a board

Click on a pin to view it and hover over it. Click on the "Save" button and choose the board you want to save the pin to.

### Search for pins

Type in a keyword in the search bar and click on the "Search" button to search for pins.

### Change your profile picture

Click on the profile picture icon in the top right corner and click on the "Change Profile Picture" button. Choose the image you want to use as your profile picture and click on the "Save" button.

### Download a pin

Click on a pin to view it and hover over it. Click on the "Download" button to download the pin image.


## Credits

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [EJS](https://ejs.co/)
- [Express](https://expressjs.com/)
- [Passport](http://www.passportjs.org/)
- [Multer](https://github.com/expressjs/multer)
- [GridFS](https://docs.mongodb.com/manual/core/gridfs/)```

