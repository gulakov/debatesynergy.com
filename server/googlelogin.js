module.exports = app = require('express').Router(), {User,Doc} = require('./models');

var request = require('request');


//redirect to Google OAuth2 approval screen
app.all('/login', function(req, res, next){

    var {next="", refresh, youtube, contacts, cloud} = req.query, {host} = req.headers

    var params = {
      response_type: "code",
      redirect_uri: "https://" + "debatesynergy.com" + "/user/auth",
      scope: "profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.install",
      client_id: google.client_id,
      access_type: "offline"
    };

    if (refresh)
      params.prompt = "consent";
    if(next)
      params.state = "https://" + host + next;
    if(youtube)
      params.scope +=" https://www.googleapis.com/auth/youtube"
    if(contacts)
      params.scope +=  " https://www.google.com/m8/feeds/"

    if(cloud)
      params.scope +=  " https://www.googleapis.com/auth/cloud-platform"


    var oauth_url = "https://accounts.google.com/o/oauth2/auth?";
    oauth_url += Object.keys(params).map(k => k + "=" + encodeURIComponent(params[k]) ).join('&');

    return res.redirect(oauth_url);
});


//Google OAuth2 callback to login or create new user
app.all('/user/auth', function(req, res, next) {
  var {code} = req.query, {client_id, client_secret} = google;

  //exchange code for access_token
  req.google({
    url: 'oauth2/v4/token',
    method: 'POST',
    form: {
       code, client_id, client_secret,
       redirect_uri: "https://" + "debatesynergy.com" + "/user/auth",
       grant_type: "authorization_code"
     }
  }, oauth_res => {

    //refresh available if explicitly requested
    var {access_token, refresh_token} = oauth_res;

    //save access_token in session
    req.session.access_token = access_token;

    //use access_token to get user info
    req.google({url: 'oauth2/v1/userinfo'}, userinfo => {

          var {name, email, picture} = userinfo;

          //remember to auto-login user through Google in future sessions
          // res.cookie('autologin', 'true', { maxAge: 1000 * 3600 * 24 * 30 });


          User.findOne({email}, function(err, u){

              if (u){ //returning user, save user object to session
                req.session.user = {_id: u._id, email: u.email};

                console.log("Login: " + u.name + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());


                if (refresh_token)
                  User.update({_id:u._id}, {auth: refresh_token, picture}).exec()



                return res.redirect(req.query.state || "/")

              } else { //new user
                User.create({
                  email,
                  name,
                  auth: refresh_token,
                  picture
                }, function (err, newAppUser ) {

                    Doc.create({
                      userid: newAppUser._id,
                      title: "First File",
                      text: "Welcome to your first file, " + newAppUser.name + "!"
                    }, function(err, firstDoc){

                      newAppUser.index=[{id: firstDoc._id, title:"First File", type:"ft-file ft-selected"}, {
                        "id": "home",
                        "title": "Home Page",
                        "type": "ft-file"}];

                      newAppUser.save(function(e){

                          console.log("NEW USER: " + newAppUser.name  + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

                            req.session.user = {_id: u._id, email: u.email};

                            if (refresh_token)
                              User.update({_id:u._id}, {auth: refresh_token}).exec()

                          return res.redirect("/")
                       });

                    });

                 });

              }

          })

      })

    });

});




//end user's session and remove cookie
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.cookie("connect.sid", "", { maxAge: 0 });
    return res.redirect("/")
});
