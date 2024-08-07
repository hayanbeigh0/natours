const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
      trim: true,
      index: "text",
    },
    email: {
      type: String,
      required: [true, "A User must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "driver", "admin", "org-admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      minlength: 8,
      validate: {
        // This only works on SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    organisations: {
      type: [mongoose.Schema.ObjectId],
      ref: "Organisation",
    },
    vehicles: {
      type: [mongoose.Schema.ObjectId],
      ref: "Vehicle",
    },
    pickupLocation: {
      // GeoJSON
      name: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
      address: String,
      description: String,
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { type: Boolean, default: true, select: false },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.index({ organisations: 1 });
userSchema.index({ name: 1 });

userSchema.pre("save", async function (next) {
  // Only run this function if the password was actually modified
  if (!this.isModified("password")) {
    return next();
  }
  //   Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedTimeStamp;
  }
  //   False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.updatePassword = function (newPassword) {
  this.password = newPassword;
  this.passwordConfirm = newPassword;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
