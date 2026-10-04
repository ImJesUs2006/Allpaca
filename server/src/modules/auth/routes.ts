import { Router } from "express";
import { requireAuth, signToken } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./schemas.js";
import * as service from "./service.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await service.register(input);
    const token = signToken(service.toAuthUser(user));
    res.status(201).json({ token, user });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await service.login(input);
    const token = signToken(service.toAuthUser(user));
    res.json({ token, user });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await service.getProfile(req.user!.id) });
  }),
);

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    res.json({ user: await service.updateProfile(req.user!.id, input) });
  }),
);

authRouter.get(
  "/directory",
  asyncHandler(async (_req, res) => {
    res.json({ users: await service.listPublicUsers() });
  }),
);
