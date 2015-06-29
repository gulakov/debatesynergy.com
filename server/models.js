var mongoose = require('mongoose'), Schema = mongoose.Schema;

exports.User = mongoose.model('User', new Schema({
    email:  String,
    name:  String,
    custom_css: String,
    custom_js: String,
    index: Object,
    socket: String,
    options: Array,
    date_created: {type: Date, default: Date.now}
}, { versionKey: false }));

exports.Doc = mongoose.model('Doc', new Schema({
    userid: String,
    title: String,
    text: String,
    date: {type: Date, default: Date.now}
}, { versionKey: false }));

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

    speech1AC: {type: String, default: ""},
    speech1NC: {type: String, default: ""},
    speech2AC: {type: String, default: ""},
    speech2NC: {type: String, default: ""},
    speech1NR: {type: String, default: ""},
    speech1AR: {type: String, default: ""},
    speech2NR: {type: String, default: ""},
    speech2AR: {type: String, default: ""},

    scroll_1AC: {type: Number, default: 0},
    scroll_1NC: {type: Number, default: 0},
    scroll_2AC: {type: Number, default: 0},
    scroll_2NC: {type: Number, default: 0},
    scroll_1NR: {type: Number, default: 0},
    scroll_1AR: {type: Number, default: 0},
    scroll_2NR: {type: Number, default: 0},
    scroll_2AR: {type: Number, default: 0},

    date_created: {type: Date, default: Date.now}
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
