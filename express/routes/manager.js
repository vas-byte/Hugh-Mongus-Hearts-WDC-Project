var express = require('express');
var router = express.Router();

// Manage EVENTs
// Route to edit/add post depending on request header
router.post('/editEvent', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const id = req.body.id;
      const title = req.body.title;
      const subtitle = req.body.subtitle;
      const content = req.body.content;
      const address_line = req.body.address_line;
      const suburb = req.body.suburb;
      const state = req.body.state;
      const postcode  = req.body.postcode;
      const datetime = req.body.datetime;
      const is_private = req.body.public;
      const organisation_id = req.body.organisation_id;

      var updateQuery = "UPDATE Events SET title=?, subtitle=?, content=?, address_line=?, suburb=?, state=?, postcode=?, public=?, datetime=? WHERE id=?";

      connection.query(updateQuery, [title, subtitle, content, address_line, suburb, state, postcode, is_private || 0, datetime, id], function(qerr, result){
        if(qerr){
          connection.release();
          res.sendStatus(500);
          return;
        }

        var emailTitle = "Event Update";

        if(result.affectedRows == 0) {
          emailTitle = "New Event";
        }

           //Send an email to all members of the organisation
           var emailQuery = "SELECT email FROM Users WHERE user_id IN (SELECT user_id FROM OrganisationMembers WHERE organisation_id=? AND event_notifications=1)";
           connection.query(emailQuery, organisation_id, function(qerr, result){
             if(qerr){
               return;
             }

             var emails = result.map(function(row){
               return row.email;
             });

              if(emails.length == 0){
                return;
              }

             //get organisation name
             var organisationQuery = "SELECT name FROM Organisations WHERE id=?";
             connection.query(organisationQuery, organisation_id, function(qerr, result){
               if(qerr){
                 return;
               }

               //organisation name
               var organisationName = result[0].name;

               //convert datetime into something readable
               var date = new Date(datetime);
               var dateString = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});

               //Set up the email
                var mailOptions = {
                 from: 'hughmongushearts@gmail.com',
                 bcc: emails,
                 subject: `Update From ${organisationName}`,
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
                         .title {
                             color: #3E000C;
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
                             margin-top: 10px;
                             margin-bottom: 20px;
                         }
                     </style>
                 </head>
                 <body>
                     <div class="container">
                         <div class="header">
                             <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                             <h1>${emailTitle}</h1>
                         </div>
                         <div class="content">
                             <h2 class="title">${title}</h2>
                             <p><strong>Description: </strong>${content}</p>
                             <p><strong>Address: </strong>${address_line + " " + suburb + " "+ state + " " + postcode}</p>
                             <p><strong>Date: </strong>${dateString}</p>
                         </div>
                         <a href="http://localhost:8080/organisations.html?id=${organisation_id}" class="button">Visit Organisation</a>
                         <div class="footer">
                             &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                         </div>
                     </div>
                 </body>
                 </html>

                 `
               };

               //Send the email
               req.transporter.sendMail(mailOptions);

             });

           });

        if(result.affectedRows == 0) {

          // No rows were updated, so insert a new post
          var insertQuery = "INSERT INTO Events(title, subtitle, content, address_line, suburb, state, postcode, public, datetime, organisation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          connection.query(insertQuery, [title, subtitle, content, address_line, suburb, state, postcode, is_private, datetime, organisation_id], function(qerr, result){
            connection.release();
            if(qerr){
              res.sendStatus(500);
              return;
            }

            return res.json({eventID: id});
          });

        } else {
          // The post was updated
          connection.release();


          return res.json({eventID: id});
        }
      });
    });
  });

// Route to delete a event
router.post('/deleteEvent', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }
      const id = req.body.id;
      const organisation_id = req.body.organisation_id;

      //Send an email to all members of the organisation
      var emailQuery = "SELECT email FROM Users WHERE user_id IN (SELECT user_id FROM OrganisationMembers WHERE organisation_id=? AND event_notifications=1)";
      connection.query(emailQuery, organisation_id, function(qerr, result){

        if(qerr){
          return res.status(500).send(qerr.message);
        }

        var emails = result.map(function(row){
          return row.email;
        });


        //get organisation name
        var organisationQuery = "SELECT name FROM Organisations WHERE id=?";
        connection.query(organisationQuery, organisation_id, function(qerr, result){
          if(qerr){
            return res.status(500).send(qerr.message);
          }

          //organisation name
          var organisationName = result[0].name;

          //get event details
          var eventQuery = "SELECT * FROM Events WHERE id=?";

          connection.query(eventQuery, id, function(qerr, result){
            if(qerr){
              return res.status(500).send(qerr.message);
            }


            var event = result[0];

            //check if event date has passed
            var now = new Date();


            //convert datetime into something readable
            var date = new Date(event['datetime']);
            var dateString = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});

            //Set up the email
            var mailOptions = {
              from: 'hughmongushearts@gmail.com',
              bcc: emails,
              subject: `Update From ${organisationName}`,
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
                      .title {
                          color: #3E000C;
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
                          margin-top: 10px;
                          margin-bottom: 20px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <img src="http://localhost:8080/images/logo.png" alt="Hugh Mongus Hearts Logo" class="logo">
                          <h1>Event Cancelled</h1>
                      </div>
                      <div class="content">
                          <h2 class="title">${event.title}</h2>
                          <p><strong>Address: </strong>${event.address_line + " " + event.suburb + " "+ event.state + " " + event.postcode}</p>
                          <p><strong>Date: </strong>${dateString}</p>
                      </div>
                      <a href="http://localhost:8080/organisations.html?id=${id}" class="button">Visit Organisation</a>
                      <div class="footer">
                          &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                      </div>
                  </div>
              </body>
              </html>

              `
            };

            //Send the email
            if(emails.length > 0 && event.datetime > now){
              req.transporter.sendMail(mailOptions);
            }


            var postquery = "DELETE FROM Events WHERE id=?";

            connection.query(postquery, id, function(qerr, result){
              connection.release();

              if(qerr){
                res.sendStatus(500);
                return;
              }

              return res.json({eventID: id});
            });

          });
        });

      });



    });
  });


// Manage POSTs
// Route to edit/add post depending on request header
router.post('/editPost', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const id = req.body.id;
      const title = req.body.title;
      const content = req.body.content;
      const is_private = req.body.is_private;
      const organisation_id = req.body.organisation_id;
      const created_by = req.user['user_id'];

      var updateQuery = "UPDATE Posts SET title=?, content=?, is_private=? WHERE id=?";

      connection.query(updateQuery, [title, content, is_private, id], function(qerr, result){
        if(qerr){
          connection.release();
          res.sendStatus(500);
          return;
        }

        if(result.affectedRows == 0) {
          // No rows were updated, so insert a new post
          var insertQuery = "INSERT INTO Posts(title, content, created_on, is_private, organisation_id, created_by) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?)";
          connection.query(insertQuery, [title, content, is_private, organisation_id, created_by], function(qerr, result){
            connection.release();
            if(qerr){
              res.sendStatus(500);
              return;
            }

            //Send an email to all members of the organisation
            var emailQuery = "SELECT email FROM Users WHERE user_id IN (SELECT user_id FROM OrganisationMembers WHERE organisation_id=? AND post_notifications=1)";
            connection.query(emailQuery, organisation_id, function(qerr, result){
              if(qerr){
                return;
              }

              var emails = result.map(function(row){
                return row.email;
              });

              if(emails.length == 0){
                return res.json({postID: id});
              }
              //get organisation name
              var organisationQuery = "SELECT name FROM Organisations WHERE id=?";
              connection.query(organisationQuery, organisation_id, function(qerr, result){
                if(qerr){
                  return;
                }

                //organisation name
                var organisationName = result[0].name;

                //Set up the email
                var mailOptions = {
                  from: 'hughmongushearts@gmail.com',
                  bcc: emails,
                  subject: `Update From Organisation ${organisationName}`,
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
                            .title {
                                color: #3E000C;
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
                                <h1>New Post</h1>
                            </div>
                            <div class="content">
                                <h2 class="title">${title}</h2>
                                <p>${content}</p>
                                <a href="http://localhost:8080/organisations.html?id=${organisation_id}" class="button">Visit Organisation</a>
                            </div>
                            <div class="footer">
                                &copy; 2024 Hugh Mongus Hearts. All rights reserved.
                            </div>
                        </div>
                    </body>
                    </html>

                  `,
                };

                //Send the email
                req.transporter.sendMail(mailOptions);
                return res.json({postID: id});

              });




            });


          });
        } else {
          // The post was updated
          connection.release();
          return res.json({postID: id});
        }
      });
    });
  });

// Route to delete a post
router.post('/deletePost', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const id = req.body.id;
      var postquery = "DELETE FROM Posts WHERE id=?";

      connection.query(postquery, id, function(qerr, result){
        connection.release();
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.json({postID: id});
      });
    });
  });

  router.post('/', function(req, res, next){
    return res.sendStatus(200);
  });

  // make manager
  router.post('/makeManager', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const organisation_id = req.body.organisation_id;
      const user_id = req.body.user_id;

      var postquery = `
      UPDATE OrganisationMembers SET is_manager = 1 WHERE organisation_id = ? AND user_id = ?
      `;

      connection.query(postquery, [organisation_id, user_id], function(qerr, result){
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.status(200).json({ is_manager: 1 });
      });

    });
  });


  // remove manager
  router.post('/removeManager', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
      if (err) {
        return res.sendStatus(500);
      }

      const { organisation_id, user_id } = req.body;

      const postquery = `
        UPDATE OrganisationMembers SET is_manager = 0 WHERE organisation_id = ? AND user_id = ?
      `;

      connection.query(postquery, [organisation_id, user_id], function(qerr, result) {
        connection.release();  // Ensure connection is released back to the pool

        if (qerr) {
          return res.sendStatus(500);
        }

        return res.status(200).json({ is_manager: 0 });
      });
    });
  });


  router.post('/deleteMember', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const organisation_id = req.body.organisation_id;
      var user_id = req.body.user_id;

      var postquery = `
      DELETE FROM OrganisationMembers WHERE organisation_id = ? AND user_id = ?
      `;

      connection.query(postquery, [organisation_id, user_id], function(qerr, result){
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.status(200).json({ is_member: 0 });
      });

    });
  });


  module.exports = router;