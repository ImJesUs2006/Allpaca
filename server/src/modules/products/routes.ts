import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { parseIdParam } from "../../utils/params.js";
import { createProductSchema, listProductsSchema } from "./schemas.js";
import * as service from "./service.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = listProductsSchema.parse(req.query);
    res.json({ products: await service.listProducts(q) });
  }),
);

productsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req);
    res.json({ product: await service.getProduct(id) });
  }),
);

productsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createProductSchema.parse(req.body);
    const product = await service.createProduct(req.user!.id, input);
    res.status(201).json({ product });
  }),
);
