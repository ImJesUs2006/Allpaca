import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { parseIdParam } from "../../utils/params.js";
import * as service from "./service.js";

export const communitiesRouter = Router();

communitiesRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    res.json({ communities: await service.listCommunities(req.user?.id ?? null) });
  }),
);

communitiesRouter.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ communities: await service.listMyCommunities(req.user!.id) });
  }),
);

communitiesRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    res.json({ community: await service.getCommunity(parseIdParam(req), req.user?.id ?? null) });
  }),
);

communitiesRouter.post(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    await service.joinCommunity(parseIdParam(req), req.user!.id);
    res.status(204).end();
  }),
);

communitiesRouter.delete(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    await service.leaveCommunity(parseIdParam(req), req.user!.id);
    res.status(204).end();
  }),
);
