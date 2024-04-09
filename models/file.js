const { Schema, model } = require("mongoose");

const path = require("path");
const fileSchema = new Schema(
  {
     filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    
    path: {
      type: Buffer,
      required: true,
    },
    createdBy: {
        type: String,
        required: true,
  },
  fileURL: {
      type: String,
      required: false,
    },
},  
  { timestamps: true }
);

const File = model("file", fileSchema);

module.exports = File;
