module.exports = app = require('express').Router(), {User,Doc} = require('./models');
var request = require('request');


//call Google APIs, with setting of access_token and refreshing it if expired
app.use(function (req, res, next) {

  req.google = ({url, method="GET", qs, form, headers={}}, callback) => {

      //sign this request with access token from session db, expires 30min
      headers['Authorization'] = 'Bearer ' + req.session.access_token;
      headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded'

      request({
        url: (url.startsWith("http")?'':'https://www.googleapis.com/')+url,
        method, qs, form, headers
      }, (error, response, body)=>{
        try {
          var body = JSON.parse(body);
        } catch(e) {
          console.log(url, method, qs, form, headers);
          callback(body) //not JSON
          return;
        }
        if (body.error){ //access_token stored in session expired, use refresh_token stored in mongodb to get access_token

            //if no user, force auto-login
            if (!req.session.user)
              return res.redirect("/login?next="+req.url)


            User.findOne({_id: req.session.user._id}, (e, u)=>{

              var refresh_token = u.auth;


              if (!refresh_token) //if no refresh token is found, prompt for it
                res.redirect("/login?refresh=true&next="+req.url)

              request({
                uri: 'https://www.googleapis.com/oauth2/v4/token',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                form: {
                   refresh_token: refresh_token,
                   client_id: google.client_id,
                   client_secret: google.client_secret,
                   grant_type: "refresh_token"
                 }
               },  (error, response, body)=>{

                  var body = JSON.parse(body);
                  if (body.error) //if refresh token failed, prompt user to re-auth refresh token
                    res.redirect("/login?refresh=true&next="+req.url)

                  //set new access_token
                  req.session.access_token = body.access_token;

                  //redo this function with new token
                  req.google({url, method, qs, form, headers}, callback)

                })

            })

        } // end check of access expired

        //return JSON google data
        callback(body)

      })
  }

  //continue to middleware
  next();
})



//takes callback from "Open With" in Google Drive to create/open file and sync
app.get('/readdrive', function(req, res) {
  var state = JSON.parse(req.query.state),
  fileId = state.exportIds || state.ids;


  //takes fileId, request google doc file metadata
  req.google({url: 'drive/v2/files/' + fileId}, docInfo => {

     if (!docInfo.exportLinks)
        return res.json(docInfo)
        console.log(
        docInfo.exportLinks["text/html"])

      //takes google doc, returns file HTML
      request({url: docInfo.exportLinks["text/html"],  headers: {
         'Authorization': 'Bearer ' + req.session.access_token
       }}, (e,r,docHTML) => {


                //updated google doc HTML with new HTML
               req.google({
                 url: 'upload/drive/v2/files/'+fileId,
                 method: 'PUT',
                 qs: {
                   uploadType: 'media'
                 },
                // form:  docHTML.replace(/(and)/gi,'Gulakov'),
                 headers: {
                   'Content-Type': 'application/vnd.google-apps.document'
                 }},  ({alternateLink}) =>
                   res.redirect(alternateLink)
                 )


        });

  })


});
