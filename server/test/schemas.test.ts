import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../src/modules/auth/schemas.js";

const valid = {
  email: "  Diego@Test.MX ",
  password: "supersecret",
  handle: "  Diego_Ruiz ",
  name: "  Diego Ruiz  ",
};

describe("registerSchema", () => {
  it("normaliza email, handle y espacios", () => {
    const parsed = registerSchema.parse(valid);
    assert.equal(parsed.email, "diego@test.mx");
    assert.equal(parsed.handle, "diego_ruiz");
    assert.equal(parsed.name, "Diego Ruiz");
  });

  it("rechaza passwords cortos", () => {
    const r = registerSchema.safeParse({ ...valid, password: "corta" });
    assert.equal(r.success, false);
  });

  it("rechaza handles con caracteres no permitidos", () => {
    for (const handle of ["ab", "con espacio", "arroba@", "guion-medio"]) {
      const r = registerSchema.safeParse({ ...valid, handle });
      assert.equal(r.success, false, `esperaba rechazar handle: ${handle}`);
    }
  });

  it("rechaza email invalido", () => {
    const r = registerSchema.safeParse({ ...valid, email: "no-es-email" });
    assert.equal(r.success, false);
  });
});

describe("loginSchema", () => {
  it("acepta email valido", () => {
    const parsed = loginSchema.parse({ email: "ADMIN@Allpaca.MX", password: "x" });
    assert.equal(parsed.email, "admin@allpaca.mx");
  });

  it("rechaza password vacia", () => {
    assert.equal(loginSchema.safeParse({ email: "a@b.mx", password: "" }).success, false);
  });
});

describe("updateProfileSchema", () => {
  it("permite objeto vacio (todo opcional)", () => {
    assert.equal(updateProfileSchema.safeParse({}).success, true);
  });

  it("rechaza bio larga", () => {
    assert.equal(updateProfileSchema.safeParse({ bio: "x".repeat(501) }).success, false);
  });

  it("rechaza avatar_url no-url", () => {
    assert.equal(updateProfileSchema.safeParse({ avatar_url: "no-es-url" }).success, false);
  });
});
