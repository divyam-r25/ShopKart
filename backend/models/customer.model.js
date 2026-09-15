const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

customerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

customerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);
