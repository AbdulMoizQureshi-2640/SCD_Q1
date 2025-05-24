const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/auth-service-test"
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth Service", () => {
  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
    });

    it("should not register a user with existing email", async () => {
      const res = await request(app).post("/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "User already exists");
    });
  });

  describe("POST /login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should not login with invalid credentials", async () => {
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});
