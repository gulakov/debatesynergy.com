var express = require('express'), app = express(),

bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
mongoose = require('mongoose'),
subdomain = require('express-subdomain'),
config = require('./config'),
https = require('https'),
http = require('http'),
fs = require('fs');

//require HTTPS
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(80);

//http.createServer(app).listen(80);

/*
var server = https.createServer({
  key: fs.readFileSync( process.env.HOME + '/letsencrypt/live/debatesynergy.com/privkey.pem'),
  cert: fs.readFileSync(process.env.HOME + '/letsencrypt/live/debatesynergy.com/fullchain.pem')
}, app).listen(443);
*/


var server = https.createServer({
  key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAtFEE2Km9oENyk6q2W23H7ee6/C+bRtq7kcGQoMq5873K3KzZ\nZSz+ZpQfRmLS0hGX3q50Dxusy8e9JmTgu8C09UpupM+1RDS01Odr6i1oy1BEueAu\nUdp9/M3N8/hQpXRLcsqzRg4wyE/duXu+BCtLTzQpbjt5mvWZB2UeihZpINC88o8Z\nKruiK8OduoDvZmjKJKr5NYtee7OXCanNuWEFBIH3dF1aX4QS8rZc2EglQcJLlLpD\nYNw6qMQUpfbftJWvVbq1DbSlGcl5eVOxkX4T/7/8KL3cYNw+Vp3Gi5CTsdgeauMi\neAqMdbBy7VLy7Vyf47tzCBhWyZe4EVkKSAfiUQIDAQABAoIBAQCSjTrEIYk2RTtN\nWzUlMB+Lc4jcyJCKUOKb/1dd6AakXMARBQcXnS8TDhYxLcas55Gocd9wHA0f/rH0\nD4876c7pgdpVZ1+rFK9YTtK9nLSMciu5asQa0NsO6fIW9N4O62sa3DZCnOv3Ejpi\nM3lniAyIThvSNNKMKEp84SmmD7rX6JI0f5Vwn3RsDxpRkfvQJtqD5X8apwK4Bfc0\nDec2NRfo3SGd8GNPivq8NDrv3hQqr/HPwBhpV7ce7uQ1GTFrwK1skbhravN4McOv\nsru03H9RC0B7uKl32VYqoh3QJxqmzBZWD+oQdz3yP90cK0jIUTLMpxCzyEIC8SY0\n4ptDM5OlAoGBANlXqAIQ+cwuf/F6EJAab1wElR+RAuaegzKaHhMPqrkexXi7NAG7\n7Qby5vcGRm181jz23fDCygwMtxGg0zeeHyRChsN1qJmWBxon3x5RouDTh3D3S1QZ\nZpVeRzm1uEzWvZma4Fwxu59cqAdpwnjpjet0jvkZ5iwgM3zwqzSFLScHAoGBANRj\ncglb21UUtM2eHURi7h46nYN6KVQbJZAeaZ0frr2aCMkgiEa6D+4VuLn2FiJduoIN\narRR2rd+1YnXq82NUGaXHK1a/h4FwolMOWjRXJhg0lBwIOxBHwileoMxYOXG2giw\nICYuAIkmwCXmwH/+4tKlgNFeny5QO1H7E5mR2z3nAoGARxNbZhGXHya1wIpikD2U\n3UrCWahagoCj9xBfdWxSMGfXvDu8LjT+tp8I2Q+8SGHizd0Nh4ar/HTMCX/GkxGq\nrXj0CUeY82EUwYD4fjnEQjHqwQ6eG8qSuZYzRLQgqUAwkOMNLBk3ek4axRHY/yGh\nv7ZGa0AE/bkqHVm3I13J/lECgYEAuZgRDbaUSpvmhwuVPa5JsGa+QCcfOFzkjTTW\nS7Rk6VBSPxdLnqp2wzF+FBrEKtHG6mC5Dsu8mb6e8W5itiO3z35bU+2AxFF6NqpC\nPKM/C/UHs7zYODuL1+1qynv61a/X1eG6pkJqu27+V+B19SORqEtx7wOFjF4WCESk\nUv1PHZ8CgYEAu6noq13RAnKLypyO7MWJALJlhBrW5y1/hIK5NQ3Hyybfc1lI1X4w\nheLTp4tmU83V0xkdWZlsR9Up/h+cQaLBJEa0skZJLHNhQzQEibB7jyxpgtUX4rYm\nNoIbSIPCg+WHr5QB8/UWxxsC12R5ZvZ14dvnxbJ8pZjxOLVKfbmYrXA=\n-----END RSA PRIVATE KEY-----',
  cert: '-----BEGIN CERTIFICATE-----\nMIIFBjCCA+6gAwIBAgISAyTpCHVEUIJWSGsoiTbJ6pWRMA0GCSqGSIb3DQEBCwUA\nMEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD\nExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0xNjA0MTkwMDUzMDBaFw0x\nNjA3MTgwMDUzMDBaMBwxGjAYBgNVBAMTEWRlYmF0ZXN5bmVyZ3kuY29tMIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtFEE2Km9oENyk6q2W23H7ee6/C+b\nRtq7kcGQoMq5873K3KzZZSz+ZpQfRmLS0hGX3q50Dxusy8e9JmTgu8C09UpupM+1\nRDS01Odr6i1oy1BEueAuUdp9/M3N8/hQpXRLcsqzRg4wyE/duXu+BCtLTzQpbjt5\nmvWZB2UeihZpINC88o8ZKruiK8OduoDvZmjKJKr5NYtee7OXCanNuWEFBIH3dF1a\nX4QS8rZc2EglQcJLlLpDYNw6qMQUpfbftJWvVbq1DbSlGcl5eVOxkX4T/7/8KL3c\nYNw+Vp3Gi5CTsdgeauMieAqMdbBy7VLy7Vyf47tzCBhWyZe4EVkKSAfiUQIDAQAB\no4ICEjCCAg4wDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggr\nBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTG7k2+ooui2Q12TowIQq0I\nmB5YmzAfBgNVHSMEGDAWgBSoSmpjBH3duubRObemRWXv86jsoTBwBggrBgEFBQcB\nAQRkMGIwLwYIKwYBBQUHMAGGI2h0dHA6Ly9vY3NwLmludC14My5sZXRzZW5jcnlw\ndC5vcmcvMC8GCCsGAQUFBzAChiNodHRwOi8vY2VydC5pbnQteDMubGV0c2VuY3J5\ncHQub3JnLzAcBgNVHREEFTATghFkZWJhdGVzeW5lcmd5LmNvbTCB/gYDVR0gBIH2\nMIHzMAgGBmeBDAECATCB5gYLKwYBBAGC3xMBAQEwgdYwJgYIKwYBBQUHAgEWGmh0\ndHA6Ly9jcHMubGV0c2VuY3J5cHQub3JnMIGrBggrBgEFBQcCAjCBngyBm1RoaXMg\nQ2VydGlmaWNhdGUgbWF5IG9ubHkgYmUgcmVsaWVkIHVwb24gYnkgUmVseWluZyBQ\nYXJ0aWVzIGFuZCBvbmx5IGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgQ2VydGlmaWNh\ndGUgUG9saWN5IGZvdW5kIGF0IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL3JlcG9z\naXRvcnkvMA0GCSqGSIb3DQEBCwUAA4IBAQAx7B7kmAi2BDSLERHFN0PcgarpXra+\nezHT+7YurLPfgIQ8/Ab09GIRmZq/Hil8ketK0f+Fou1uAiayE2U1iIVqJeaIG0Br\n0yIwk8lVxPmv3j6vmKh/l+XNg+5s7a0n6UOcM82MeyI8simClK6GG9cQj0j7E3pw\nnxP/4VXV1qCa0lCKP78TvRohmrR9sEr+MNYMXYBmRBZzp0WTLHks7uLJQt8DpSC9\n6vgXJQOzA4d8txviROVdYyhX69hqcQuJ8BLN1RVh9c7kl17nw8/CH8HDImfOSL7T\nCKkqziWETGY1R6wxhe08y1kPZBmLoRIqLeMBELyC0/wzW1m6TeBmmtbZ\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA/\nMSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\nDkRTVCBSb290IENBIFgzMB4XDTE2MDMxNzE2NDA0NloXDTIxMDMxNzE2NDA0Nlow\nSjELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUxldCdzIEVuY3J5cHQxIzAhBgNVBAMT\nGkxldCdzIEVuY3J5cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEAnNMM8FrlLke3cl03g7NoYzDq1zUmGSXhvb418XCSL7e4S0EF\nq6meNQhY7LEqxGiHC6PjdeTm86dicbp5gWAf15Gan/PQeGdxyGkOlZHP/uaZ6WA8\nSMx+yk13EiSdRxta67nsHjcAHJyse6cF6s5K671B5TaYucv9bTyWaN8jKkKQDIZ0\nZ8h/pZq4UmEUEz9l6YKHy9v6Dlb2honzhT+Xhq+w3Brvaw2VFn3EK6BlspkENnWA\na6xK8xuQSXgvopZPKiAlKQTGdMDQMc2PMTiVFrqoM7hD8bEfwzB/onkxEz0tNvjj\n/PIzark5McWvxI0NHWQWM6r6hCm21AvA2H3DkwIDAQABo4IBfTCCAXkwEgYDVR0T\nAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAYYwfwYIKwYBBQUHAQEEczBxMDIG\nCCsGAQUFBzABhiZodHRwOi8vaXNyZy50cnVzdGlkLm9jc3AuaWRlbnRydXN0LmNv\nbTA7BggrBgEFBQcwAoYvaHR0cDovL2FwcHMuaWRlbnRydXN0LmNvbS9yb290cy9k\nc3Ryb290Y2F4My5wN2MwHwYDVR0jBBgwFoAUxKexpHsscfrb4UuQdf/EFWCFiRAw\nVAYDVR0gBE0wSzAIBgZngQwBAgEwPwYLKwYBBAGC3xMBAQEwMDAuBggrBgEFBQcC\nARYiaHR0cDovL2Nwcy5yb290LXgxLmxldHNlbmNyeXB0Lm9yZzA8BgNVHR8ENTAz\nMDGgL6AthitodHRwOi8vY3JsLmlkZW50cnVzdC5jb20vRFNUUk9PVENBWDNDUkwu\nY3JsMB0GA1UdDgQWBBSoSmpjBH3duubRObemRWXv86jsoTANBgkqhkiG9w0BAQsF\nAAOCAQEA3TPXEfNjWDjdGBX7CVW+dla5cEilaUcne8IkCJLxWh9KEik3JHRRHGJo\nuM2VcGfl96S8TihRzZvoroed6ti6WqEBmtzw3Wodatg+VyOeph4EYpr/1wXKtx8/\nwApIvJSwtmVi4MFU5aMqrSDE6ea73Mj2tcMyo5jMd6jmeWUHK8so/joWUoHOUgwu\nX4Po1QYz+3dszkDqMp4fklxBwXRsW10KXzPMTZ+sOPAveyxindmjkW8lGy+QsRlG\nPfZ+G6Z6h7mjem0Y+iWlkYcV4PIWL1iwBi8saCbGS5jN2p8M+X+Q7UNKEkROb3N6\nKOqkqm57TH2H3eDJAkSnh6/DNFu0Qg==\n-----END CERTIFICATE-----'
}, app).listen(443);




var io = require('socket.io')(server);


//database
mongoose.connect('mongodb://localhost/debatedata', {server: { poolSize: 10 }});


//middleware
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb', parameterLimit: 10000, defer: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 10000, defer: true}));
app.use(session({secret: config.cookie, resave: true, saveUninitialized: true }));
app.use(require('compression')())


//admin
var subRouter = express.Router();
subRouter.use('/',  require('mongo-express/lib/middleware')(require('./config.mongo')))
app.use(subdomain('admin', subRouter));


//routes
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
app.use('/team', require('./server/team'));
app.use('/round', require('./server/round')(io));
app.use('/', require('./server/home'));

app.use(require('serve-static')(__dirname + '/public', {  maxAge: config.cache ? 1000 * 3600 * 24 : 0  }))

//errors
app.use(function(err, req, res, next) {
//  res.status(404);
  res.send(err.stack)
});

     /*
app.use(function(err, req, res, next){

  if(err.status == 400)
    return res.send('Request Aborted');
});
*/
