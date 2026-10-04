import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { parseIdParam } from "../../utils/params.js";
import { createOrderSchema, updateOrderStatusSchema } from "./schemas.js";
import * as service from "./service.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const raw = String(req.query.role ?? "all");
    const role = raw === "buyer" || raw === "seller" ? raw : "all";
    res.json({ orders: await service.listOrders(req.user!.id, role) });
  }),
);

ordersRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    res.json(await service.dashboardSummary(req.user!.id));
  }),
);

ordersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    res.status(201).json({ order: await service.createOrder(req.user!.id, input) });
  }),
);

ordersRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req);
    const input = updateOrderStatusSchema.parse(req.body);
    res.json({ order: await service.updateOrderStatus(req.user!.id, id, input) });
  }),
);
