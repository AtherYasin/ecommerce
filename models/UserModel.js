const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    data: String,
    contentType: String,
  },
  gender: {
    type: String,
    required: true,
  },
  roles: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  transport: [String],
  dob: {
    type: String,
    required: true,
  },
  registrationdate: {
    type: Date,
    default: Date().toLocaleString(),
  },
  whoAdded: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
