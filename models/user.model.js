const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    birthdate: {
      type: Date,
    },
    image: String,
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please Enter you email"],
    },
    phone: {
      type: String,
    },
    emailVerifyCode: String,
    emailVerifyExpiers: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ["user", "mentor", "admin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: false,
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    consultaions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ConsultationTicket" },
    ],
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],

    address: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
