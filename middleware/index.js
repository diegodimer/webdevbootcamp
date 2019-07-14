const Campground    = require('../models/campground');
const Comment       = require('../models/comment');
var middlewareObj   = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // quando cai nesse middleware direciona pra pagina e mostra a mensagem, erro e a mensagem
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};



middlewareObj.checkCampgroundOwnership = function (req, res, next){
    if(req.isAuthenticated()){ // user ta logado
        Campground.findById(req.params.id, function(err, foundCamp) { // acha o campo
            if(err){ 
                req.flash("error", "Campground not found on our database");
                res.redirect("back");
            } else { 
                if(foundCamp.author.id.equals(req.user._id)){ // foundcamp.author.id retorna objeto enquanto req.user._id é string, nao da pra comprar (com o equals da)
                    next(); // vai adiante se o dono do campo é o user atual
                }else{
                    req.flash("info", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else{ // user nao ta nem logado
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};


middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){ // user ta logado
        Comment.findById(req.params.comment_id, function(err, foundComment) { // acha o campo
            if(err){ 
                req.flash("info", "You don't have permission to do that!");
                res.redirect("back");
            } else { 
                if(foundComment.author.id.equals(req.user._id)){ // foundcamp.author.id retorna objeto enquanto req.user._id é string, nao da pra comprar (com o equals da)
                    next(); // vai adiante se o dono do campo é o user atual
                }else{
                    req.flash("info", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else{ // user nao ta nem logado
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};


module.exports = middlewareObj;