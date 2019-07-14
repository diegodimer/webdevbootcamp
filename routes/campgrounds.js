const express       = require('express');
const router        = express.Router();
const  Campground   = require('../models/campground');
const  Comment      = require('../models/comment');
const middleware    = require('../middleware');
const multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/", function(req, res){
    var campGrounds = Campground.find({ }, function(err, campgrounds){
        if(err){
            res.send("cuzao");
        }
        else{
            res.render("campgrounds/index", {campGrounds: campgrounds});
        }
    });

});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	console.log(req.body);	
	cloudinary.uploader.upload(req.file.path, function(result) {
	// add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
		console.log("FILE PATH:");
		console.log(req.file.path);
		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		Campground.create(req.body.campground, function(err, campground) {
		if (err) {
			req.flash('error', err.message);
		return res.redirect('back');
		}
		res.redirect('/campgrounds/' + campground.id);
	});
	});
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render('campgrounds/new')
});


// SHOW - shows more info about a campground
router.get("/:id", function(req, res){
    var campId = req.params.id;
    // no campground eu só salvo o id do comentario, essa linha faz o join das coisas
    Campground.findById(campId).populate("comments").exec(function(err, foundCamp){
        if(err){
            req.flash("info", "This campground doesn't exist!");
            res.redirect("/");
        }else {
            res.render("campgrounds/show", {campground: foundCamp});
        }
    });
});

// edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById( req.params.id, function(err, foundCamp){
        if(!err){
            res.render("campgrounds/edit", {campground: foundCamp});           
        }        
    });
     
});


// update campground route
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
	console.log("hit de edit route");	
	newCampground = req.body.campground;
	Campground.findById( req.params.id, function(err, foundCamp){
        if(!err){
            var imageId = foundCamp.image;
			imageId = imageId.slice( imageId.lastIndexOf("/")+1, imageId.lastIndexOf("."));   
			
			try{
					cloudinary.uploader.upload(req.file.path, function(result) {
						newCampground.image = result.secure_url;
						cloudinary.uploader.destroy(imageId, (error, result) => { 
							console.log("image removed sucessfuly from edit route");
							Campground.findByIdAndUpdate( req.params.id, newCampground, function(err, updatedCamp){
								if(!err){
									req.flash("success", "campground updated successfully");
									res.redirect("/campgrounds/" + req.params.id);
									console.log(updatedCamp);
									console.log("printed camp");
								}else{
									req.flash("error", "This campground couldn't be updated :(");
								res.redirect("/");
								}
							})
						} );
						
					});
			}
			catch(e){
				Campground.findByIdAndUpdate( req.params.id, newCampground, function(err, updatedCamp){
					if(!err){
						req.flash("success", "campground updated successfully");
						res.redirect("/campgrounds/" + req.params.id);
						console.log(updatedCamp);
						console.log("printed camp");
					}else{
						req.flash("error", "This campground couldn't be updated :(");
						res.redirect("/");
					}
				})
			};
		}        
    }); 
});


//destroy campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	
	Campground.findByIdAndRemove(req.params.id, function(err, removedCamp){
        if(!err){
			var imageId = removedCamp.image;
			imageId = imageId.slice( imageId.lastIndexOf("/")+1, imageId.lastIndexOf("."));
			cloudinary.uploader.destroy(imageId, (error, result) => { 
			console.log("image removed sucessfuly");
			} );
            removedCamp.comments.forEach( function(comment){
                Comment.findOneAndDelete(comment, function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
            req.flash("success", "Campground deleted successfully!");
            res.redirect("/campgrounds");
        }
    });    
});



module.exports = router;