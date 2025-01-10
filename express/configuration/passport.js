const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const credentials = require('./credentials.json');

// Serialize the user information into the session
passport.serializeUser(function(user, done) {
    // Store the entire user object in the session
    done(null, user);
});

// Deserialize the user information from the session
passport.deserializeUser(function(user, done) {
    // Retrieve the user object from the session
    done(null, user);
});

// Configure Passport to use Google OAuth 2.0 strategy for authentication
passport.use(new GoogleStrategy({
        clientID: credentials.web.client_id, // Google Client ID from Google Developer Console
        clientSecret: credentials.web.client_secret, // Google Client Secret from Google Developer Console
        callbackURL: credentials.web.redirect_uris[0], // URL to which Google will redirect after authentication
        passReqToCallback: true // Pass the request object to the callback function
    },
    function(request, accessToken, refreshToken, profile, done) {

        //TODO: add user to database
        const profileJson = profile._json;

        //See if email exists in Database
        request.pool.query("SELECT * FROM Users WHERE email = ?", profileJson.email, function(err, rows, fields) {

            //if an error return
            if(err){
                return done(null, false, {message: err.message});
            }

            // If last name is null, make it empty string
            if(profileJson.family_name == null){
                profileJson.family_name = "";
            }


            //Create new user in db
            if (rows.length == 0){
                request.pool.query("INSERT INTO Users (first_name, last_name, email, is_oauth, is_admin) VALUES (?, ?, ?, ?, ?)", [profileJson.given_name, profileJson.family_name, profileJson.email, "1", "0"], function(err,result){

                    if(err){
                        return done(null, false, {message: err.message});
                    }

                    // return profile to serializer
                    return done(null, {first_name: profileJson.given_name, last_name: profileJson.family_name, email: profileJson.email, user_id: result.insertId});
                })
            } else {

                //check firstname and lastname match profile otherwise update them
                if(rows[0]["first_name"] != profileJson.given_name || rows[0]["last_name"] != profileJson.family_name){
                    request.pool.query("UPDATE Users SET first_name = ?, last_name = ? WHERE email = ?", [profileJson.given_name, profileJson.family_name, profileJson.email], function(err, result){
                        if(err){
                            return done(null, false, {message: err.message});
                        }

                        // return profile to serializer
                        return done(null,  { first_name: rows[0]["first_name"], last_name: rows[0]["last_name"], email: rows[0]["email"], user_id: rows[0]["user_id"] })

                    });
                } else {
                    return done(null,  { first_name: rows[0]["first_name"], last_name: rows[0]["last_name"], email: rows[0]["email"], user_id: rows[0]["user_id"] })
                }
            }


        });


    }
));

// Configure Passport to use Local strategy (email and password) for authentication
passport.use(new LocalStrategy(
    {
        usernameField: 'useremail',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {

        //Search for user in database with provided email
        req.pool.query("SELECT * FROM Users WHERE email = ?", email, async function (err, result) {

            //if a database error return
            if (err) {
                return done(null, null, { message: err.message});
            }

            //No user exists for that email
            if (result.length == 0) {
                return done(null, null, { message: "user does not exist for email"})
            }

            //Otherwise compare the password
            bcrypt.compare(password, result[0]["user_password"], function (err, res) {
            if (err) {
                return done(null, null, { message: err.message});
            }

            //If passwords match store info on user
            if (res) {
                var user = {};
                user = { first_name: result[0]["first_name"], last_name: result[0]["last_name"], email: result[0]["email"], user_id: result[0]["user_id"] };
                return done(null, user);

            //Otherwise passwords don't match
            } else {
                return done(null, null, { message: "Passwords Do Not Match" });
            }
        });
    });
}));



