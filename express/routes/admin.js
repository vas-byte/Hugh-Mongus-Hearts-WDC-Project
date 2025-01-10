var express = require('express');
var router = express.Router();

// Route to add a new organisation
router.post('/addOrganisation', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const name = req.body.name;
      const address_line = req.body.address_line;
      const suburb = req.body.suburb;
      const state = req.body.state;
      const postcode = req.body.postcode;
      const statement = req.body.statement;

      var postquery = "INSERT INTO Organisations(name, address_line, suburb, state, postcode, statement) VALUES (?, ?, ?, ?, ?, ?)";

      connection.query(postquery, [name, address_line, suburb, state, postcode, statement], function(qerr, result){
        connection.release();
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.status(200).json({organisationID: result.id});
      });
    });
  });

  // Route to delete an organisation
router.post('/deleteOrganisation', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const id = req.body.id;
      var postquery = "DELETE FROM Organisations WHERE id=?";

      connection.query(postquery, id, function(qerr, result){
        connection.release();
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.status(200).json({organisationID: id});
      });
    });
  });

  // Route to edit organisation information
  router.post('/editOrganisation', function(req, res, next){
    req.pool.getConnection(function(err, connection){
      if(err){
        res.sendStatus(500);
        return;
      }

      const id = req.body.id;
      const name = req.body.name;
      const address_line = req.body.address_line;
      const suburb = req.body.suburb;
      const state = req.body.state;
      const postcode = req.body.postcode;
      const statement = req.body.statement;

      var postquery = "UPDATE Organisations SET name=?, address_line=?, suburb=?, state=?, postcode=?, statement=? WHERE id=?";

      connection.query(postquery, [name, address_line, suburb, state, postcode, statement, id], function(qerr, result){
        connection.release();
        if(qerr){
          res.sendStatus(500);
          return;
        }
        return res.json({organisationID: id});
      });
    });
  });

  router.get('/', function(req, res, next){
    return res.sendStatus(200);
  });

  module.exports = router;