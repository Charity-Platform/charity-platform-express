const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const employeeSchema = new Schema({
  name: String,
  address: String,
  phone: Number,
  age: Number,
  department: String,
  depDiscription: String,
  image: String,
  pdf: String,
  link: {
    type: String,
    default: "",
    required: false,
  },
});
const EmployeeRequest = mongoose.model("EmployeeRequest", employeeSchema);

module.exports = EmployeeRequest;
