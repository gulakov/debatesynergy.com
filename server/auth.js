var app = require('express').Router(), model = require('./models');
var passport = require('passport'), GoogleStrategy = require('passport-google-oauth2').Strategy;
module.exports = app;
var User = model.User, Doc = model.Doc;


passport.serializeUser(function(profile, done) {
  done(null, profile);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//callback after user accepts permissions, will pass user object to req.user global, if new user create object and the first file
passport.use(new GoogleStrategy({
    clientID: '675454780693-7n34ikba11h972dgfc0kgib0id9gudo8.apps.googleusercontent.com',
    clientSecret: '8TbemY_MUonCCRhhuIjwV-ho',
    callbackURL: "http://debatesynergy.com/auth/index/callback",
  }, function(request, accessToken, refreshToken, profile, done) {

    User.findOne({email: profile.email}, function(err, u){

        if (u){ //returning user
          console.log("Login: "+u.name + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
          process.nextTick(function () {
            return done(null, u);
          });

        } else { //new user
          User.create({
            email: profile.email,
            name: profile.displayName,
          }, function (err, newAppUser ) {

              Doc.create({
                userid: newAppUser._id,
                title: "First File",
                text: "Welcome to your first file, " + newAppUser.name + "!"
              }, function(err, firstDoc){

                newAppUser.index=[{id: firstDoc._id, title:"First File", type:"file"}];

                newAppUser.save(function(e){

                    console.log("NEW USER: " + newAppUser.name  + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

                    process.nextTick(function () {
                      return done(null, newAppUser);
                    });
                 });

              });

           });

        }

    })

  }
));

app.use(passport.initialize());
app.use(passport.session());

//scope of which permissions to ask user for email, name, and drive file read/write
app.get('/auth', passport.authenticate('google',
  { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive']
}));

app.get( '/auth/index/callback',
      passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/'
}));

app.get('/auth/logout', function(req, res){
  res.clearCookie('debatesynergylogin');
  req.logout();
  res.redirect('/');
});

module.exports = app;
