const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");

let authToken;
let testBlogId;

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/blog-service-test"
  );

  // Create a test user token
  authToken = jwt.sign(
    { userId: new mongoose.Types.ObjectId() },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Blog Service", () => {
  describe("POST /blogs", () => {
    it("should create a new blog with valid token", async () => {
      const res = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Blog",
          content: "This is a test blog content",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "Test Blog");
      testBlogId = res.body._id;
    });

    it("should not create blog without token", async () => {
      const res = await request(app).post("/blogs").send({
        title: "Test Blog",
        content: "This is a test blog content",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /blogs", () => {
    it("should get all blogs", async () => {
      const res = await request(app).get("/blogs");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should get a specific blog", async () => {
      const res = await request(app).get(`/blogs/${testBlogId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Test Blog");
    });
  });

  describe("DELETE /blogs/:id", () => {
    it("should delete blog with valid token", async () => {
      const res = await request(app)
        .delete(`/blogs/${testBlogId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("should not delete blog without token", async () => {
      const res = await request(app).delete(`/blogs/${testBlogId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
