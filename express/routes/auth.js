var express = require('express');
const passport = require('passport');
require('../configuration/passport.js');
var router = express.Router();
var authRoute = require('../configuration/tools.js');
const bcrypt = require('bcrypt');
var crypto = require('crypto');

router.use(passport.initialize());
router.use(passport.session());

//sends auth failed message - only for email/password
router.get("/failed", (req, res) => {

    if(req.session.messages.pop() == 'user does not exist for email'){
      res.status(401).send("This Email does not exist");
    } else if (req.session.messages.pop() == 'Passwords Do Not Match'){
      res.status(401).send("Password incorrect");
    } else {
      res.status(401).send(req.session.messages.pop());
    }

});

//checks for failed auth error message - google only
router.get("/google/error", (req, res) => {

    //if error message exists return it
    if(req.session.messages){
      res.status(401).send(req.session.messages.pop());

    //otherwise return no errors found
    } else{
      res.status(200).send("No Errors Found");
    }

});

//sends auth suceeded message - only for email/pasword
router.get("/success", authRoute.checkAuthenticated, (req, res) => {

  req.pool.query("SELECT * FROM Users WHERE user_id = ?", req.user['user_id'], function(err, rows, fields) {
    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }
    if (rows.length != 0){
      res.status(200).json({
        is_admin: rows[0]['is_admin'],
        user_id: rows[0]['user_id'],
      });
    } else {
      res.status(200).json({
        is_admin: 0,
        user_id: -1,
      });
    }

  });


});

//performs auth via google OAuth
router.get('/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
    ));

//callback from google OAuth (routes user to next page)
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login.html', //on fail return user to login page and show error message
        failureMessage: true
    }),
    function (req, res) {
        res.redirect('/organisation-list.html'); //on success redirect user organisation-list page
    }
);

//endpoint to logout user - both email and password
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/home');
  });
});

//endpoint to login user with email and password
router.post('/login/password',
  passport.authenticate('local', {failureRedirect: '/auth/failed', failureMessage: true}),
  function(req, res) {

    //returns 200 for client side routing
    res.redirect('/auth/success');
});

//endpoint to create user with email and password
router.post('/register', (req, res) => {

  const saltRounds = 10;

  //Check user does not already exist
  req.pool.query("SELECT * FROM Users WHERE email = ?", req.body.email, function(err, rows, fields) {

    //if an error return
    if(err){

        return res.status(500).send(err.message);
    }

    //if user already exists, return error
    if (rows.length != 0){
        return res.status(500).send("User already exists");
    }

    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {

          //check if admin token exists
          if(req.body.token === null){
            req.body.token = '';
          } else {
            req.body.token = req.body.token.trimStart();
          }

          //check database for admin token
          req.pool.query("SELECT * FROM AdminTokens WHERE token = ?", req.body.token, function(err, rows, fields) {

            var is_admin = 0;

            //if token exists and emails match set is_admin to 1
            if (!err && rows.length > 0 && rows[0]["email"] == req.body.email){
              is_admin = 1;
            }

            //delete token
            if(is_admin){
              req.pool.query("DELETE FROM AdminTokens WHERE token = ?", req.body.token, function(err, result) {

                //if an error return
                if(err){

                    return res.status(500).send(err.message);
                }

              });
            }

            //create database query to insert new user
            req.pool.query("INSERT INTO Users (first_name, last_name, email, is_oauth, is_admin, user_password) VALUES (?, ?, ?, ?, ?, ?)", [req.body.first_name, req.body.last_name, req.body.email, "0", is_admin, hash], function (err){

              //check for error and return error if one has occured
              if(err){

                return res.status(500).send(err.messages);
              }

              //redirect user to login page
              return res.status(200).send();

            });


          });

          });
      });

  });

});

//Send reset link
router.post('/reset', authRoute.checkAuthenticated, function(req, res, next) {

  //Set User ID of profile
  var userID = "";

  // if user_id supplied then use that, otherwise use current user
  if(req.body.user_id){
    userID = req.body.user_id;
  } else {
    userID = req.user["user_id"];
  }

  //Check if supplied userID matches uid of user making request
  if(userID != req.user["user_id"]){
    authRoute.checkIsAdmin;
  }

  //Generate a reset token
  var token = crypto.randomBytes(20).toString('hex');


  //check user does not have more than 5 tokens
  req.pool.query("SELECT * FROM ResetTokens WHERE user_id = ?", userID, function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //if user has more than 5 tokens return error
    if (rows.length >= 5){
      return res.status(400).send("Too many tokens");
    }

  });

  //Put it in the database
  req.pool.query("INSERT INTO ResetTokens (user_id, token) VALUES (?,?)", [userID, token], function(err, result) {

    //if an error return
    if(err){

        return res.status(500).send(err.message);
    }


     //Set up the email
     var mailOptions = {
      from: 'hughmongushearts@gmail.com',
      to: req.body.email,
      subject: 'Password Reset',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #FFFFFF;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  border-radius: 10px;
                  background-color: #FFFFFF;
              }
              .header {
                  background-color: #D10000;
                  color: #FFFFFF;
                  padding: 10px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
              }
              .logo {
                  max-width: 100px;
                  margin: 20px auto;
              }
              .content {
                  color: #FB4B4E;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  color: #FFCBDD;
                  font-size: 12px;
              }
              .button {
                  background-color: #3E000C;
                  color: #FFFFFF;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                  <h1>Password Reset</h1>
              </div>
              <div class="content">
                  <p>Click the button below to reset your password:</p>
                  <a href="http://localhost:8080/reset.html?token=${encodeURIComponent(token)}" class="button">Reset Password</a>
              </div>
              <div class="footer">
                  &copy; 2024 Hugh Mongus Hearts. All rights reserved.
              </div>
          </div>
      </body>
      </html>
      `

    };

    //Send the email
    req.transporter.sendMail(mailOptions, function(error, info){
      if (error) {

        //if an error return
        return res.status(500).send(error.message);
      } else {

        //otherwise return 200
        return res.status(200).send();
      }
    });

  });



});

//verify token - for admin signups and password resets
router.get('/verify/:token', function(req, res, next) {


  //Check if token exists
  req.pool.query("SELECT * FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //if token does not exist return error
    if (rows.length == 0){

      //Search for admin token
      req.pool.query("SELECT * FROM AdminTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

        //if an error return
        if(err){
          return res.status(500).send(err.message);
        }

        //if token does not exist return error
        if (rows.length == 0){
          return res.status(403).send("Token does not exist");
        }

        //otherwise return 200
        return res.status(200).send();

      });

    } else {
       //otherwise return 200
      return res.status(200).send();
    }

  });

});

//reset password from token
router.post('/reset/:token', function(req, res, next) {

  //Check if token exists
  req.pool.query("SELECT * FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //if token does not exist return error
    if (rows.length == 0){
      return res.status(403).send("Token does not exist");
    }

    //hash the password
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {

          //update the user password
          req.pool.query("UPDATE Users SET user_password = ? WHERE user_id = ?", [hash, rows[0]["user_id"]], function(err, result) {

            //if an error return
            if(err){
                return res.status(500).send(err.message);
            }

            //Delete token
            req.pool.query("DELETE FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, result) {

              //if an error return
              if(err){
                  return res.status(500).send(err.message);
              }

            //otherwise return 200
            return res.status(200).send();

          });

      });
    });


  //redirect user to login page
  res.status(200).send();

  });



  });
});

//verify token - for admin signups and password resets
router.get('/verify/:token', function(req, res, next) {

  //Check if token exists
  req.pool.query("SELECT * FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //if token does not exist return error
    if (rows.length == 0){

      //Search for admin token
      req.pool.query("SELECT * FROM AdminTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

        //if an error return
        if(err){
          return res.status(500).send(err.message);
        }

        //if token does not exist return error
        if (rows.length == 0){
          return res.status(403).send("Token does not exist");
        }

        //otherwise return 200
        return res.status(200).send();

      });

    } else {
       //otherwise return 200
      return res.status(200).send();
    }

  });

});

//reset password from token
router.post('/reset/:token', function(req, res, next) {

  //Check if token exists
  req.pool.query("SELECT * FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //if token does not exist return error
    if (rows.length == 0){
      return res.status(403).send("Token does not exist");
    }

    //hash the password
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {

          //update the user password
          req.pool.query("UPDATE Users SET user_password = ? WHERE user_id = ?", [hash, rows[0]["user_id"]], function(err, result) {

            //if an error return
            if(err){
                return res.status(500).send(err.message);
            }

            //Delete token
            req.pool.query("DELETE FROM ResetTokens WHERE token = ?", req.params.token.trimStart(), function(err, result) {

              //if an error return
              if(err){
                  return res.status(500).send(err.message);
              }

            //otherwise return 200
            return res.status(200).send();

          });

      });
    });


    });

  });

});

//send reset email
router.post('/email/reset', function(req, res, next) {

  //Check if token exists
  req.pool.query("SELECT * FROM Users WHERE email = ?", req.body.email, function(err, rows, fields) {

    //Generate a reset token
    var token = crypto.randomBytes(20).toString('hex');

    //if no user exists return
    if(rows.length == 0){
      return res.status(200).send();
    }

    //check if user uses password auth
    if(rows[0]["is_oauth"] == 1){
      return res.status(200).send();
    }

    if(err){
      return res.status(200).send();
    }

    var userid = rows[0]["user_id"];

    //check if more than 5 tokens exist for email
    req.pool.query("SELECT * FROM ResetTokens WHERE user_id = ?", userid, function(err, rows, fields) {

      //if an error return
      if(err){
          return res.status(200).send();
        }

      //if user has more than 5 tokens return
      if (rows.length >= 5){
        return res.status(200).send();
      }


      req.pool.query("INSERT INTO ResetTokens (user_id, token) VALUES (?,?)", [userid, token], function(err, result) {

          //if an error return
          if(err){
              return res.status(200).send();
          }

          //Set up the email
          var mailOptions = {
            from: 'hughmongushearts@gmail.com',
            to: req.body.email,
            subject: 'Password Reset',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #FFFFFF;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        border-radius: 10px;
                        background-color: #FFFFFF;
                    }
                    .header {
                        background-color: #D10000;
                        color: #FFFFFF;
                        padding: 10px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .logo {
                        max-width: 100px;
                        margin: 20px auto;
                    }
                    .content {
                        color: #FB4B4E;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        color: #FFCBDD;
                        font-size: 12px;
                    }
                    .button {
                        background-color: #3E000C;
                        color: #FFFFFF;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Click the button below to reset your password:</p>
                        <a href="http://localhost:8080/reset.html?token=${encodeURIComponent(token)}" class="button">Reset Password</a>
                    </div>
                    <div class="footer">
                        &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            `

          };

          //Send the email
          req.transporter.sendMail(mailOptions, function(error, info){
            if (error) {

              //if an error return
              return res.status(200).send(error.message);
            } else {

              //return 200
              return res.status(200).send();
            }
          });
            });

    });



  });

});

//create new user from email
router.post('/register/email', authRoute.checkIsAdmin, (req, res) => {


    //check if admin registered
    if(req.body.admin){

        //Check user does not already exist
        req.pool.query("SELECT * FROM Users WHERE email = ?", req.body.email, function(err, rows, fields) {

          //if an error return
          if(err){

              return res.status(500).send(err.message);
          }

          //if user already exists, return error
          if (rows.length != 0){
              return res.status(500).send("User already exists");
          }

          //Generate a reset token
          var token = crypto.randomBytes(20).toString('hex');

          //Put it in the database
          req.pool.query("INSERT INTO AdminTokens (email, token) VALUES (?,?)", [req.body.email, token], function(err, result) {

            //if an error return
            if(err){


                if(err.message.includes("Duplicate entry")){
                  return res.status(500).send("Administrator signup already requested");
                }

                return res.status(500).send(err.message);
            }


            //Set up the email
            var mailOptions = {
              from: 'hughmongushearts@gmail.com',
              to: req.body.email,
              subject: 'Sign Up',
              html: `
              <!DOCTYPE html>
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #FFFFFF;
                          margin: 0;
                          padding: 0;
                      }
                      .container {
                          max-width: 600px;
                          margin: 20px auto;
                          padding: 20px;

                          border-radius: 10px;
                          background-color: #FFFFFF;
                      }
                      .header {
                          background-color: #D10000;
                          color: #FFFFFF;
                          padding: 10px;
                          text-align: center;
                          border-radius: 10px 10px 0 0;
                      }
                      .logo {
                          max-width: 100px;
                          margin: 20px auto;
                      }
                      .content {
                          color: #FB4B4E;
                          margin: 20px 0;
                      }
                      .footer {
                          text-align: center;
                          color: #FFCBDD;
                          font-size: 12px;
                      }
                      .button {
                          background-color: #3E000C;
                          color: #FFFFFF;
                          padding: 10px 20px;
                          text-decoration: none;
                          border-radius: 5px;
                          display: inline-block;
                          margin-top: 20px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                          <h1>Welcome to Hugh Mongus Hearts</h1>
                      </div>
                      <div class="content">
                          <p>Please click the button below to verify your email address and complete your registration:</p>
                          <a href="http://localhost:8080/sign-up.html?adminToken=${encodeURIComponent(token)}" class="button">Register</a>
                          <p>If you were not signed up for this account, please ignore this email.</p>
                      </div>
                      <div class="footer">
                          &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                      </div>
                  </div>
              </body>
              </html>
              `
            };

            //Send the email
            req.transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                //if an error return
                return res.status(500).send(error.message);
              } else {

                //return 200
                return res.status(200).send();
              }});


          });

        });

    } else {


      //Set up the email
      var mailOptions = {
        from: 'hughmongushearts@gmail.com',
        to: req.body.email,
        subject: 'Sign Up',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #FFFFFF;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;

                    border-radius: 10px;
                    background-color: #FFFFFF;
                }
                .header {
                    background-color: #D10000;
                    color: #FFFFFF;
                    padding: 10px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .logo {
                    max-width: 100px;
                    margin: 20px auto;
                }
                .content {
                    color: #FB4B4E;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #FFCBDD;
                    font-size: 12px;
                }
                .button {
                    background-color: #3E000C;
                    color: #FFFFFF;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                    <h1>Welcome to Hugh Mongus Hearts</h1>
                </div>
                <div class="content">
                    <p>Please click the button below to verify your email address and complete your registration:</p>
                    <a href="http://localhost:8080/sign-up.html/" class="button">Register</a>
                    <p>If you were not signed up for this account, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `
      };

      //Send the email
      req.transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          //if an error return
          return res.status(500).send(error.message);
        } else {

          //return 200
          return res.status(200).send();
        }});

    }

});

//Delete User Profile
router.delete('/remove/:id?', authRoute.checkAuthenticated, function(req, res, next) {

  if(req.params.id === undefined){
    req.params.id = req.user["user_id"];
  }

  //Check if supplied userID matches uid of user making request
  if (req.params.id != req.user["user_id"]){

    //check user is an admin - if not return 402
    authRoute.checkIsAdmin;

  }

  req.pool.query("DELETE FROM Users WHERE user_id = ?", req.params.id, function(err, result) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //otherwise redirect to logout
    if (req.params.id == req.user["user_id"]){
      req.logout(function(err) {
        return res.status(200).send("User Deleted, Logged Out");
      });

    } else {

      //otherwise return 200
      return res.status(200).send("User Deleted");
    }

});

});

module.exports = router;