var mongoose = require('mongoose'), Schema = mongoose.Schema;

exports.User = mongoose.model('User', new Schema({
    email:  String,
    name:  String,
    google_id: String,
    index: String,
    socket: String,
    options: Array,
    date_created: {type: Date, default: Date.now}
}));

exports.Doc = mongoose.model('Doc', new Schema({
    userid: String,
    title: String,
    text: String,
    date: {type: Date, default: Date.now}
}));

exports.Round = mongoose.model('Round', new Schema({
    aff1: String,
    aff2: String,
    neg1: String,
    neg2: String,
    judge1: String,

    status_aff1: {type: Boolean, default: false},
    status_aff2: {type: Boolean, default: false},
    status_neg1: {type: Boolean, default: false},
    status_neg2: {type: Boolean, default: false},
    status_judge1: {type: Boolean, default: false},

    speech1AC: String,
    speech1NC: String,
    speech2AC: String,
    speech2NC: String,
    speech1NR: String,
    speech1AR: String,
    speech2NR: String,
    speech2AR: String,

    scroll_1AC: {type: Number, default: 0},
    scroll_1NC: {type: Number, default: 0},
    scroll_2AC: {type: Number, default: 0},
    scroll_2NC: {type: Number, default: 0},
    scroll_1NR: {type: Number, default: 0},
    scroll_1AR: {type: Number, default: 0},
    scroll_2NR: {type: Number, default: 0},
    scroll_2AR: {type: Number, default: 0},
}));



exports.Download = mongoose.model('Download', new Schema({
    ip: String,
    geo: String,
    sys: String, 
    date: {type: Date, default: Date.now}
}));
