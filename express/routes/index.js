var express = require('express');
var router = express.Router();
var path = require('path');
var authRoute = require('../configuration/tools.js');

// Redirect to home page
router.get('/', function(req, res, next) {
  res.redirect('/home');
});

// Serve home page
router.get('/home', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});



/*                    ORGANISATION-LIST                          */
// Route to get all organisations for organisation-list.html page
router.get('/organisation-list', function(req, res, next){
  req.pool.getConnection(function(err,connection){
    if(err){
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM Organisations"; // Returning all organisation information to be used for searches and display
    /* This does not need to be secure as all information is publically displayed regardless */
    connection.query(query, function(qerr, rows, fields){
      // console log the output of the query
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows);
    });
  });
});

/*                    ORGANISATION Page                          */
// Route to get organisation information based on ID
router.get('/organisation/:id', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    var user_id = 0;
    if (req.user){
      user_id = req.user['user_id'];
    }
    const organisation_id = req.params.id;
    var postquery = `
      SELECT Organisations.*, OrganisationMembers.*
      FROM Organisations
      LEFT JOIN OrganisationMembers ON Organisations.id = OrganisationMembers.organisation_id AND OrganisationMembers.user_id = ?
      WHERE Organisations.id = ?
    `;

    connection.query(postquery, [user_id, organisation_id], function(qerr, rows, fields){
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows[0]);
    });
  });
});

/*                    posts                          */
// Route to get a post based on ID
router.get('/post/:id', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    const id = req.params.id;
    var postquery = "SELECT * FROM Posts WHERE id=?";

    connection.query(postquery, id, function(qerr, rows, fields){
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows[0]);
    });
  });
});

// Route to get all attendees
router.get('/attendees-list/:event_id', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    const event_id = req.params.event_id;
    var postquery = 'SELECT Users.* FROM Attendees JOIN Users ON Attendees.user_id = Users.user_id WHERE Attendees.event_id = ?';

    connection.query(postquery, event_id, function(qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      return res.json(rows);
    });
  });
});


// Route to get all posts
router.get('/posts-list', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    var organisationId = parseInt(req.query.organisationId, 10);
    if (isNaN(organisationId)) {
      res.status(400).json({ error: "Invalid organisation ID" });
      return;
    }

    var postquery = `
      SELECT
        Posts.*,
        Users.first_name,
        Users.last_name
      FROM
        Posts
      JOIN
        Users ON Posts.created_by = Users.user_id
      WHERE
        Posts.organisation_id = ?
      ORDER BY Posts.created_on DESC;
      `;

    connection.query(postquery, [organisationId], function(qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      return res.json(rows);
    });
  });
});

/*                    events                          */
// route for a user to say they are going/notgoing to event
router.get('/event-going/:event_id', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    const event_id = req.params.event_id;
    if (req.user === undefined){
      res.status(401).send("not signed in");
      return;
    }

    const user_id = req.user['user_id'];

    var query = "SELECT * FROM Attendees WHERE event_id=? AND user_id=?";
    connection.query(query, [event_id, user_id], function(qerr, rows, fields) {
      if (qerr) {
        connection.release();
        res.sendStatus(500);
        return;
      }

      if (rows.length > 0) {
        // User is already going to the event, remove them
        var deleteQuery = "DELETE FROM Attendees WHERE event_id=? AND user_id=?";
        connection.query(deleteQuery, [event_id, user_id], function(dqerr, result) {
          connection.release();
          if (dqerr) {
            res.sendStatus(500);
            return;
          }
          res.status(200).json({ going: 0});
        });
      } else {
        // User is not going to the event, add them
        var insertQuery = "INSERT INTO Attendees (event_id, user_id) VALUES (?, ?)";
        connection.query(insertQuery, [event_id, user_id], function(iqerr, result) {
          connection.release();
          if (iqerr) {
            res.sendStatus(500);
            return;
          }
          res.status(200).json({ going: 1});
        });
      }
    });
  });
});

// Route to get a event based on ID
router.get('/event/:id', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    const id = req.params.id;
    var postquery = "SELECT * FROM Events WHERE id=?";

    connection.query(postquery, id, function(qerr, rows, fields){
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows[0]);
    });
  });
});

// route to get all events + whether user is going
router.get('/events-list', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    var organisationId = req.query.organisationId;
    var userId = 0;
    if (req.user){
      userId = req.user['user_id'];
    }

    var postquery = `
    SELECT e.id AS event_id, e.title, e.subtitle, e.content, e.address_line, e.suburb, e.state, e.postcode, e.datetime, e.public,
            IF(a.user_id IS NULL, 0, 1) AS is_attending,
            (SELECT COUNT(*) FROM Attendees WHERE event_id = e.id) AS num_attendees
    FROM Events e
    LEFT JOIN Attendees a ON e.id = a.event_id AND a.user_id = ?
    WHERE e.organisation_id = ?
    ORDER BY e.datetime;
    `;

    connection.query(postquery, [userId, organisationId], function(qerr, rows, fields){
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows);
    });
  });
});

/*                    members                          */
router.get('/members-list', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    var organisationId = parseInt(req.query.organisationId, 10);
    if (isNaN(organisationId)) {
      res.status(400).json({ error: "Invalid organisation ID" });
      return;
    }

    var postquery = `
    SELECT
        bm.is_manager,
        u.first_name,
        u.last_name,
        u.is_admin,
        u.user_id
    FROM
        OrganisationMembers bm
    JOIN
        Users u ON bm.user_id = u.user_id
    WHERE
        bm.organisation_id = ?
    ORDER BY
        bm.is_manager DESC`;

    connection.query(postquery, [organisationId], function(qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      return res.json(rows);
    });
  });
});

// Route to get organisation information based on ID
router.get('/organisation/:id', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    const id = req.params.id;
    var postquery = "SELECT * FROM Organisations WHERE id=?";

    connection.query(postquery, id, function(qerr, rows, fields){
      connection.release();
      if(qerr){
        res.sendStatus(500);
        return;
      }
      return res.json(rows[0]);
    });
  });
});

router.post('/joinOrganisation', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    const organisation_id = req.body.organisation_id;
    if (req.user === undefined){
      res.status(401).send('not signed in');
      return;
    }
    var user_id = req.user['user_id'];

    var postquery = `
    INSERT INTO OrganisationMembers(is_manager, organisation_id, user_id) VALUES (?, ?, ?)
    `;

    connection.query(postquery, [false, organisation_id, user_id], function(qerr, result){
      if(qerr){
        return res.sendStatus(500);
      }
      return res.status(200).json({ is_member: 1 });
    });

  });
});


router.post('/leaveOrganisation', function(req, res, next){
  req.pool.getConnection(function(err, connection){
    if(err){
      res.sendStatus(500);
      return;
    }

    const organisation_id = req.body.organisation_id;
    if (req.user === undefined){
      res.status(401).send('not signed in');
      return;
    }
    var user_id = req.user['user_id'];

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

// Route to get organisations where a user belongs
router.get('/myOrganisations/:id?', authRoute.checkAuthenticated, function(req, res, next){

   //Set User ID of profile
   var userID = "";

   if(req.params.id){
     userID = req.params.id;
   } else {
     userID = req.user["user_id"];
   }

   //Check if supplied userID matches uid of user making request
   if (userID != req.user["user_id"]){

     //check user is an admin - if not return 402
     !authRoute.checkIsAdmin;

   }

   //fetch list of organisations
    req.pool.query("SELECT Organisations.*, OrganisationMembers.event_notifications, OrganisationMembers.post_notifications FROM OrganisationMembers JOIN Organisations ON OrganisationMembers.organisation_id = Organisations.id WHERE OrganisationMembers.user_id = ?", userID, function(err, rows, fields) {

      //if an error return
      if(err){
        return res.sendStatus(500);
      }

      //otherwise return 200
      return res.json(rows);

    });

});


// Update notification settings for organisation
router.post('/updateNotifications', authRoute.checkAuthenticated, function(req, res, next){

  //Set User ID of profile
  var userID = "";

  if(req.params.id){
    userID = req.params.id;
  } else {
    userID = req.user["user_id"];
  }

  //Check if supplied userID matches uid of user making request
  if (userID != req.user["user_id"]){

    //check user is an admin - if not return 402
    !authRoute.checkIsAdmin;

  }

  //otherwise update remaining profile attributes
  req.pool.query("UPDATE OrganisationMembers SET event_notifications = ?, post_notifications = ? WHERE user_id = ? AND organisation_id = ?", [req.body.event_notifications, req.body.post_notifications, userID, req.body.organisation_id], function(err, result) {

    //if an error return
    if(err){

        return res.sendStatus(500);
    }

    //otherwise return 200
    return res.sendStatus(200);

  });

});

//contact form emailer
router.post('/contact', function(req, res, next){

  //send email to admin
  var mailOptions = {
    from: 'hughmongushearts@gmail.com',
    to: req.body.email,
    subject: `Thankyou for your Enquiry`,
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
                <h1>Enquiry</h1>
            </div>
            <div class="content">
                <p>Thanks for your Enquiry, our friendly team will be in touch shortly.</p>
            <div class="footer">
                &copy; 2024 Hugh Mongus Hearts. All rights reserved.
            </div>
        </div>
        </div>
    </body>
    </html>
    `
  };

  // send mail with defined transport object
  req.transporter.sendMail(mailOptions, function(error, info){
    if (error) {

      res.sendStatus(500);
    } else {

      //get email of all admins
      req.pool.query("SELECT email FROM Users WHERE is_admin = 1", function(err, rows, fields) {

        //if an error return
        if(err){
          return res.sendStatus(500);
        }

        //create variable with array of admin emails
        var emails = [];
        rows.forEach(function(row){
          emails.push(row.email);
        });

        //send email to all admins
        var mailOptions = {
          from: 'hughmongushearts@gmail.com',
          to: emails,
          subject: `Enquiry from ${req.body.name}`,
          replyTo: req.body.email,
          html: `
          <!DOCTYPE html>
          <html>
          <p>Name: ${req.body.name}</p>
          <p>Email: ${req.body.email}</p>
          <p>Message: ${req.body.message}</p>
          </html>
          `
        };

        req.transporter.sendMail(mailOptions, function(error, info){

          //if an error return
          if(error){
            return res.sendStatus(500);
          }

          return res.redirect('/contact.html');
        });


      });


    }
  });



});


// Check if user is an Admin to
// router.get('/validateAdmin', function())

module.exports = router;
