import express from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { Course } from "../models/Course";
import { isAuth } from "./auth";
const router = express.Router();

router.get(
    "/",
    query("name").optional().isString(),
    query("category").optional().isString(),
    query("duration").optional().isString(),
    query("price").optional().isNumeric(),
    query("subscribers").optional().isNumeric(),
    checkErrors,
    async (req,res)=>{
        const courses = await Course.find({ ...req.query });
    res.json(courses);
    }
);

router.get(
    "/:id", 
    param("id").isMongoId(), 
    checkErrors, 
    async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }
    res.json(course);
  });

  router.get(
    "/category", 
    param("category").isString().notEmpty(), 
    checkErrors, 
    async (req, res) => {
    const { category } = req.params;
    const course = await Course.find({params:category});
    if (!course) {
      return res.status(404).json({ message: "courses not found" });
    }
    res.json(course);
  });

  router.delete(
    "/:id",
    header("authorization").isJWT(),
    param("id").isMongoId(),
    checkErrors,
    isAuth,
    async (req, res) => {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: "course not found" });
      }
      await Course.findByIdAndDelete(id);
      res.json({ message: "course deleted" });
    }
  );

  router.post(
    "/",
    header("authorization").isJWT(),
    body("name").exists().isString(),
    body("category").exists().isString(),
    body("duration").exists().isString(),
    body("price").exists().isNumeric(),
    body("subscribers").exists().isNumeric(),
    checkErrors,
    isAuth,
    async (req, res) => {
      const { name, category, duration, price, subscribers } = req.body;
      const course = new Course({ name, category, duration, price, subscribers });
      const courseSaved = await course.save();
      res.status(201).json(courseSaved);
    }
  );

  export default router;