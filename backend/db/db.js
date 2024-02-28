const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/paytm");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness of the username field
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
});


const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const User = mongoose.model("User", UserSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
    User,
    Account,
};