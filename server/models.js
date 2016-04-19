var mongoose = require('mongoose'), Schema = mongoose.Schema;

exports.User = mongoose.model('User', new Schema({
    email:  String,
    name:  String,
    auth: String,
    custom_css: String,
    custom_js: String,
    index: Object,
    socket: String,
    options: Object,
    notifications: Array,
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: Date.now}
}, { versionKey: false }));

exports.Doc = mongoose.model('Doc', new Schema({
    userid: String,
    title: String,
    text: String,
    share: String,
    shareusers: Array,
    google_sync: Object,
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: Date.now}
}, { versionKey: false }));

exports.Round = mongoose.model('Round', new Schema({
    aff1: Object,
    aff2: Object,
    neg1: Object,
    neg2: Object,
    judges: Object,

    speech1AC: Object,
    speech1NC: Object,
    speech2AC: Object,
    speech2NC: Object,
    speech1NR: Object,
    speech1AR: Object,
    speech2NR: Object,
    speech2AR: Object,

    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: Date.now}
}, { versionKey: false }));



exports.Team = mongoose.model('Team', new Schema({
    name: String,
    users: Array,
    admins: Array,
    date: {type: Date, default: Date.now}
}, { versionKey: false }));


exports.Download = mongoose.model('Download', new Schema({
    ip: String,
    geo: String,
    sys: String,
    date: {type: Date, default: Date.now}
}, { versionKey: false }));


exports.Visit = mongoose.model('Visit', new Schema({
    ip: String,
    geo: String,
    sys: String,
    date: {type: Date, default: Date.now}
}, { versionKey: false }));
