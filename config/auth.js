module.exports = {
    ensureAuthenticated : function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg',"please log in to view this source")
        res.redirect('/users/login')
    },
    forwardAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){
            return res.redirect('/');
        }
        return next();
    }
}