const   express         = require('express'),
        app             = express(),
        bodyparser      = require('body-parser'),
        mongoose        = require('mongoose'),
        passport        = require('passport'),
        LocalStrategy   = require('passport-local'),
        methodOverride  = require('method-override'),
        flash           = require('connect-flash'),
        seedDB          = require('./seeds'),
        Campground      = require('./models/campground'),
        Comment         = require('./models/comment'),
        User            = require('./models/user');
        
// routes das coisas        
const   campgroundRoutes= require('./routes/campgrounds'),
        commentRoutes   = require('./routes/comments'),
        indexRoutes     = require('./routes/index');
        
 
// conecta com a database
mongoose.connect(process.env.DATABASEURL, { 
	useNewUrlParser: true,
	useCreateIndex: true});

// poem pra usar o body-parser (aí eu consigo usar req.body. ( name do input )
app.use(bodyparser.urlencoded({extended: true}));
// nao precisar por .ejs no final dos arquivos
app.set('view engine', 'ejs');

// usar o method-override pra mimetizar as put e delete requests 
app.use(methodOverride("_method"));

// flash messages: aquelas coisas tipo you need to be logged in to do that etc
app.use(flash());

// deleta tudo e popula a db de novo (pra testes)
//seedDB();

// use stylesheet (faz eu conseguir usar tudo da pasta public usando só /stylesheets/main.css na header)
app.use(express.static( __dirname + "/public"));

// configuração do passport
app.use(require('express-session')({
    secret: "arroz com feijão",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// poem um middleware em todas as rotas (automatico) aí cada vez 
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
   // passa o argumento message que é o que é pra mostrar (error pq eu defini antes lá que é a mensagem de erro)
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
});

// moment: pra ter aquele ''12 seconds ago'' etc 
app.locals.moment = require('moment');

// routes em outros arquivos (app.gets)
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//===================================================
// inicia o servidor

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("server has started on v12"); 
   console.log(process.env.PORT);
});