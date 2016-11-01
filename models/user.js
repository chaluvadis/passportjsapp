var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    email: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    isDirectUser: {
        type: Boolean,
        default: true
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback)
        });
    });
}

module.exports.getUserByEmail = function (email, callback) {
    var query = {
        email: email
    };

    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.comparePasswords = function(password, hash, callback){
    bcrypt.compare(password, hash, function(err, isMatch) {
        if(err) return err;
        callback(null, isMatch);
    });
}