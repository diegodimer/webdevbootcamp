const express       = require('express');
// merge params faz os parametros lá da rota ( que quando eu importei e dei app.use tinha o :id, faz o id ser disponivel aqui
const router        = express.Router({mergeParams: true});
const Campground    = require('../models/campground');
const Comment       = require('../models/comment');
const middleware    = require('../middleware');

// ========================
// comments routes 

router.get("/new", middleware.isLoggedIn, function(req, res){
     var campId = req.params.id;
    Campground.findById(campId).populate("comments").exec(function(err, foundCamp){
        if(err){
            res.send("nao existe bicho");
        }else {
            res.render("comments/new", {campground: foundCamp});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    // procuro o campground com o id
    Campground.findById(req.params.id, function(err, foundCamp){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            // adicionar username e id no comentario
           // req.user // da o usuario e como tem a isloggedin tem certeza de que tem um usuário
           
            Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err);
               } else{
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   foundCamp.comments.push(comment);
                   foundCamp.save();
                   res.redirect("/campgrounds/" + req.params.id);
               }
            });
        }
    });
    // crio o comentario
    // adiciono o comentario no campground
    // redireciona
});

//routes de edição e update de comentario
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById( req.params.comment_id, function(err, comment) {
        if(!err){
            res.render("comments/edit", {campgroundId: req.params.id, comment: comment});
        } 
        else{
            res.redirect("back");
        }
    });
    
});


router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findOneAndUpdate( { _id: req.params.comment_id }, req.body.comment, function(err, comment){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment updated successfully");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })    
});

// delete route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findOneAndDelete( {_id: req.params.comment_id}, function(err, comment){
       if(!err){
           req.flash("success", "comment deleted successfully");
           res.redirect('back');
       } else {
       }
    });
});



module.exports = router;