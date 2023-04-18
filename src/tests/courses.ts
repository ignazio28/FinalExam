import request from "supertest";
require("chai").should();
import { app } from "../app";
import { Course } from "../models/Course";
import bcrypt from "bcrypt";
import { User as UserSchema } from "../models/User";
import { saltRounds } from "../routes/auth";
import jwt from "jsonwebtoken";
const jwtToken = "shhhhhhh";

const basicUrl = "/v1/courses";

describe.only("/courses",()=>{
    const course = {
        name : "Inglese1",
        category : "Lingue",
        duration : "6h",
        price : 50,
        subscribers : 1000
    };
    const user = {
        name: "Ignazio",
        surname: "Lentini",
        email: "ignazio@gmail.com",
        password: "passwordd",
    };
    let token: string;
    before(async () => {
    const userCreated = new UserSchema({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: await bcrypt.hash(user.password, saltRounds),
    });
    await userCreated.save();
    token = jwt.sign(
        {
        id: userCreated._id,
        email: userCreated.email,
        name: userCreated.name,
        surname: userCreated.surname,
        },
          jwtToken
        );
        console.log("token:", token);
    });
    after(async () => {
        await UserSchema.findOneAndDelete({ email: user.email });
      });

    describe("create course", () => {
        let id: string;
        after(async () => {
          await Course.findByIdAndDelete(id);
        });
        it("failed test 401", async () => {
          const { status } = await request(app).post(basicUrl).send(course);
          status.should.be.equal(401);
        });
        it("success test 201", async () => {
          const { status, body } = await request(app)
            .post(basicUrl)
            .send(course)
            .set({ authorization: token });
          status.should.be.equal(201);
          body.should.have.property("_id");
          body.should.have.property("name").equal(course.name);
          body.should.have.property("category").equal(course.category);
          body.should.have.property("duration").equal(course.duration);
          body.should.have.property("price").equal(course.price);
          body.should.have.property("subscribers").equal(course.subscribers);
          id = body._id;
        });
    });

    describe("delete course", () => {
        let id: string;
        before(async () => {
          const p = await Course.create(course);
          id = p._id.toString();
        });
        it("test failed 401", async () => {
          const { status } = await request(app).delete(`${basicUrl}/${id}`);
          status.should.be.equal(401);
        });
        it("test success 200", async () => {
          const { status } = await request(app)
            .delete(`${basicUrl}/${id}`)
            .set({ authorization: token });
          status.should.be.equal(200);
        });
    });

    describe("get courses", () => {
        let ids: string[] = [];
        const courses = [
          {
            name : "Inglese2",
            category : "Lingue",
            duration : "6h",
            price : 50,
            subscribers : 1000
          },
          {
            name : "Inglese3",
            category : "Lingue",
            duration : "6h",
            price : 50,
            subscribers : 1000
          },
          {
            name : "Inglese4",
            category : "Lingue",
            duration : "6h",
            price : 50,
            subscribers : 1000
          },
        ];
        before(async () => {
          const response = await Promise.all([
            Course.create(courses[0]),
            Course.create(courses[1]),
            Course.create(courses[2]),
          ]);
          ids = response.map((item) => item._id.toString());
        });
        after(async () => {
          await Promise.all([
            Course.findByIdAndDelete(ids[0]),
            Course.findByIdAndDelete(ids[1]),
            Course.findByIdAndDelete(ids[2]),
          ]);
        });
    
        it("test success 200", async () => {
          const { status, body } = await request(app).get(basicUrl);
          status.should.be.equal(200);
          body.should.have.property("length").equal(courses.length);
        });
    });
    
    describe("get course", () => {
        let id: string;
        before(async () => {
          const p = await Course.create(course);
          id = p._id.toString();
        });
        after(async () => {
          await Course.findByIdAndDelete(id);
        });
        it("test success 200", async () => {
          const { status, body } = await request(app).get(`${basicUrl}/${id}`);
          status.should.be.equal(200);
          body.should.have.property("_id").equal(id);
          body.should.have.property("name").equal(course.name);
          body.should.have.property("category").equal(course.category);
          body.should.have.property("duration").equal(course.duration);
          body.should.have.property("price").equal(course.price);
          body.should.have.property("subscribers").equal(course.subscribers);
        });
        it("test unsuccess 404 not valid mongoId", async () => {
          const fakeId = "a" + id.substring(1);
          const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
          status.should.be.equal(404);
        });
    });

    

})