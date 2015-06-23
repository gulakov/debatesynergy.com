var express = require('express');
var app = express.Router();
var passport = require( 'passport' ),
    GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

var model = require('./models');
var User = model.User, Doc = model.Doc;

passport.serializeUser(function(profile, done) {
  done(null, profile);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: '675454780693-7n34ikba11h972dgfc0kgib0id9gudo8.apps.googleusercontent.com',
    clientSecret: '8TbemY_MUonCCRhhuIjwV-ho',
    callbackURL: "http://debatesynergy.com/auth/index/callback",
  }, function(request, accessToken, refreshToken, profile, done) {

    User.findOne({email: profile.email}, function(err, u){

        if (u){ //returning user
          console.log("Login from "+u.name);
          process.nextTick(function () {
            return done(null, u);
          });

        } else { //new user
          User.create({
            email: profile.email,
            name: profile.displayName,
            google_id: profile.id
          }, function (err, newAppUser ) {

              Doc.create({
                userid: newAppUser._id,
                title: "First",
                text: "First file"
              }, function(err, firstDoc){

                newAppUser.index= '[{"id":"' +
                  firstDoc._id +'","title":"First","type":"file"}]';

                newAppUser.save(function(e){

                    console.log("New User " + newAppUser.name);

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

app.use( passport.initialize());
app.use( passport.session());


app.get('/auth', passport.authenticate('google',
  { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive']
}));

app.get( '/auth/index/callback',
      passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/'
}));

app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth');
}



module.exports = app;