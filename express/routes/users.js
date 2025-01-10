var express = require('express');
var router = express.Router();
var authRoute = require('../configuration/tools.js');


/* GET users listing. */

//Get user profile - if no parameters supplied then get for current user
router.get('/profile/:id?', authRoute.checkAuthenticated, function(req, res, next) {

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

  req.pool.query("SELECT * FROM Users WHERE user_id = ?", userID, function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //user does not exist, internal server error
    if (rows.length == 0){
        res.status(500).send();
    }

    //otherwise return JSON with user data
    res.json({first_name: rows[0]['first_name'], last_name: rows[0]['last_name'], email: rows[0]['email'], is_admin: rows[0]['is_admin'], is_oauth: rows[0]['is_oauth']});

});

});



//Update user profile - if no params supplied, then for current profile
router.post('/profile/:id?', authRoute.checkAuthenticated, function(req, res, next) {

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
    authRoute.checkIsAdmin;

    //if user is admin - update isAdmin property of profile
    req.pool.query("UPDATE Users SET is_admin = ? WHERE user_id = ?", [req.body.is_admin, userID], function(err, result) {

      //if an error return
      if(err){
        return res.status(500).send(err.message);
       }

    });

  }

  //otherwise update remaining profile attributes
  req.pool.query("UPDATE Users SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?", [req.body.first_name, req.body.last_name, req.body.email, userID], function(err, result) {

    //if an error return
    if(err){

        return res.status(500).send(err.message);
    }

    //otherwise return 200
    res.status(200).send();

});

});

//Retrieve list of user profiles
router.get('/profiles', authRoute.checkIsAdmin, function(req, res, next) {

  req.pool.query("SELECT * FROM Users", function(err, rows, fields) {

    //if an error return
    if(err){
        return res.status(500).send(err.message);
    }

    //user does not exist, internal server error
    if (rows.length == 0){
        res.status(500).send();
    }

    //otherwise return JSON with user data
    res.json({rows});

});

});


module.exports = router;
