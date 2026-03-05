import { describe, it, expect } from "vitest";
import { AppError } from "./AppError";

describe("AppError", () => {
  it("should create an error with message and default status 400", () => {
    const error = new AppError("Something went wrong");

    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  it("should create an error with custom status code", () => {
    const error = new AppError("Not found", 404);

    expect(error.statusCode).toBe(404);
  });

  it("should be an instance of Error", () => {
    const error = new AppError("test");

    expect(error).toBeInstanceOf(Error);
  });
});
