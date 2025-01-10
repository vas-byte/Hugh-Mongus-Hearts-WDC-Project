module.exports = {
    checkAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.status(403).send();
    },

    checkIsAdmin: function(req, res, next) {

        //if user not authenticated
        if (!req.isAuthenticated()){
            return res.status(403).send();
        }

        //check if user is an admin
        req.pool.query("SELECT * FROM Users WHERE user_id = ?", req.user['user_id'], function(err, rows, fields) {

            //if an error return
            if(err){
                return res.status(500).send(err.message);
            }

            //check if user is admin
            if(rows[0]["is_admin"] == 1){
                return next();
            }

            //otherwise return 403
            res.status(403).send();
        });
    },
    checkIsManager: function(req, res, next) {
        //if user not authenticated
        if (!req.isAuthenticated()){
            return res.status(403).send();
        }

        //check if user is an admin
        req.pool.query("SELECT * FROM Users WHERE user_id = ?", req.user['user_id'], function(err, rows, fields) {

            //if an error return
            if(err){
                return res.status(500).send(err.message);
            }

            //check if user is admin
            if(rows[0]["is_admin"] == 1){
                return next();
            }
            //check if user is an manager
            req.pool.query("SELECT * FROM OrganisationMembers WHERE user_id = ? and organisation_id = ?", [req.user['user_id'], req.body.organisation_id], function(err, rows, fields) {

                //if an error return
                if(err){
                    return res.status(500).send(err.message);
                }

                //check if user is member
                if (rows.length == 0){
                    //otherwise return 403
                    return res.status(403).send("non member");
                }

                // check if they are a manager
                if(rows[0]["is_manager"] == 1){
                    return next();
                }

                //otherwise return 403
                return res.status(403).send("non manager");
            });
        });
    },

};
