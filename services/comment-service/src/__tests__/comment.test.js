const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");

let authToken;
let testCommentId;
const testBlogId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/comment-service-test"
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

describe("Comment Service", () => {
  describe("POST /comments", () => {
    it("should create a new comment with valid token", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Test comment",
          blogId: testBlogId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("content", "Test comment");
      testCommentId = res.body._id;
    });

    it("should not create comment without token", async () => {
      const res = await request(app).post("/comments").send({
        content: "Test comment",
        blogId: testBlogId,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /comments/blog/:blogId", () => {
    it("should get all comments for a blog", async () => {
      const res = await request(app).get(`/comments/blog/${testBlogId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("DELETE /comments/:id", () => {
    it("should delete comment with valid token", async () => {
      const res = await request(app)
        .delete(`/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("should not delete comment without token", async () => {
      const res = await request(app).delete(`/comments/${testCommentId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
