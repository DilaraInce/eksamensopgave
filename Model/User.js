const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { 
        type: String, 
        require: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, require: true},
    firstname: { type: String, require: true},
    lastname: { type: String, require: true},
    age: { type: String, require: true}, 
    country: { type: String, require: true},
    aboutme: { type: String, require: false},
    gender: { type: String, require: true}, 
    like: { type: [String], require: false},
    dislike: { type: [String], require: false},
    matches: { type: [String], require: false}
}); 


module.exports = mongoose.model('User', userSchema);