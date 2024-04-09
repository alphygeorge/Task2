const { Schema, model } = require("mongoose");


const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
     content: {
      type: String,
      required: true,
    },
    createdBy: {
        type: String,
        required: true,
  }
},  
  { timestamps: true }
);

const Task = model("task", taskSchema);

module.exports = Task;
