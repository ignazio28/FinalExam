import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true},
    category: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    subscribers : {type : Number, required: true},
  });
  
  export const Course = mongoose.model("Course", CourseSchema);