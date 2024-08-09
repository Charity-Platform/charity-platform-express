const mongoose = require("mongoose");

const { Schema } = mongoose;

const fieldSchema = new Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Field = mongoose.model("fields", fieldSchema);
module.exports = Field;













