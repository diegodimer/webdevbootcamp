const express   = require('express');
const router    = express.Router();
const User      = require('../models/user');
const passport  = require('passport');


router.get("/", function(req, res){
    res.render('landing');
});

// ===================== 
//register route
router.get("/register", function(req, res){
   res.render("register"); 
});

//post pra sign up
router.post("/register", function(req, res) {
    var newUser = new User( {
        username: req.body.username
    });
    User.register( newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("info", "Welcome to YelpCamp, "+ req.user.username + "!");
            res.redirect("/campgrounds");
        });
    } ); 
});

//==============================================
// login routes 
router.get("/login", function(req, res) {
    res.render("login");
});

// middleware no meio pra fazer antes de tudo, exatamente quando entra, o authenticate decide se vai pra frente ou nao

router.post("/login", passport.authenticate('local', {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
}) ,function(req, res){
});

// =================================================
// logout route

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});


module.exports = router;