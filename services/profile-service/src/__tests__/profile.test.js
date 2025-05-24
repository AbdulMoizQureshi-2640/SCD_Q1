const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");

let authToken;
let testProfileId;

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/profile-service-test"
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

describe("Profile Service", () => {
  describe("POST /profile", () => {
    it("should create a new profile with valid token", async () => {
      const res = await request(app)
        .post("/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "Test bio",
          avatar: "https://example.com/avatar.jpg",
          name: "Test User",
          location: "Test Location",
          website: "https://example.com",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("bio", "Test bio");
      testProfileId = res.body._id;
    });

    it("should not create profile without token", async () => {
      const res = await request(app).post("/profile").send({
        bio: "Test bio",
        avatar: "https://example.com/avatar.jpg",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /profile", () => {
    it("should get profile with valid token", async () => {
      const res = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("bio", "Test bio");
    });

    it("should not get profile without token", async () => {
      const res = await request(app).get("/profile");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("PUT /profile", () => {
    it("should update profile with valid token", async () => {
      const res = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "Updated bio",
          location: "Updated location",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("bio", "Updated bio");
      expect(res.body).toHaveProperty("location", "Updated location");
    });

    it("should not update profile without token", async () => {
      const res = await request(app).put("/profile").send({
        bio: "Updated bio",
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
