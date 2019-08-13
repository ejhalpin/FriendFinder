# FriendFinder

Social Media at it's finest. Friend Finder is, at it's heart, a sassy survey site. Users can create an account, edit their profile picture and a brief (256 character) brand statement that is visible by other users. Users must take the stock profile survey to make their initial connection. After that, users are free to make their own surveys and post them to the site, and take any number of surveys any number of times.

Each time a user takes a survey their scores are stored in the database and compared with other users who have taken the same survey. A match is determined using math and that match is shared with both the user and the match.

A user's match data appears in their profile, where they can click on their match and view their name, brand, and photo.

## How it works

Friend Finder is a full stack project that runs on a node environment. **Express** and **mySQL** power the server logic and storage, while **Bootstrap** and custom styling provide sleek and lightweight views to the client. **Handlebars** and server-side rendering with express makes for fast-loading of surveys.

The site utilizes an object relational model and an api to serve up endpoints to the client.

## Details

### User Authentication

Pass by token model similar to google, with minimal exposure of the user credentials. the **node crypto** module is used, specifically the `pbkdf2Sync` method, which is a password based key derivation algotithm that iterates over a user password, taking in a salt, to generate a hex token that cannot be decrypted back to the password. The _token_ that is generated is then stored in the database. Future logins by email/password will use the same algoritm to check against the stored token.

### DB Structure

The database is a collection of 4 of tables

- user_profile
  - stores the user id, user name, email, token, brand, photo, and status
- surveys
  - stores the survey id, survey name, number of questions, author, question content
- scores
  - stores the user id, survey id, user answers
- matches
  - stores the user id, match id, and survey id

### API Structure

The API is broken into two parts - html routes, and api routes

html routes serve up static website files

api routes interact with the database through a series of asyn/await methods and return data to the server for processing

there is also an endpoint to serve up all table data, accessible with these four calls:

- [/api/search/user_profile](https://peaceful-falls-16849.herokuapp.com/api/search/user_profile)
- [/api/search/surveys](https://peaceful-falls-16849.herokuapp.com/api/search/surveys)
- [/api/search/scores](https://peaceful-falls-16849.herokuapp.com/api/search/scores)
- [/api/search/matches](https://peaceful-falls-16849.herokuapp.com/api/search/matches)

### Seeing is Believing

Check out the live site [here](https://peaceful-falls-16849.herokuapp.com)! Make a profile and get a friend!
