import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { parseIdParam } from "../../utils/params.js";
import { sendMessageSchema, startConversationSchema } from "./schemas.js";
import * as service from "./service.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ conversations: await service.listConversations(req.user!.id) });
  }),
);

messagesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = startConversationSchema.parse(req.body);
    const id = await service.startConversation(req.user!.id, input);
    res.status(201).json({ conversation_id: id });
  }),
);

messagesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req);
    res.json({ messages: await service.listMessages(req.user!.id, id) });
  }),
);

messagesRouter.post(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req);
    const input = sendMessageSchema.parse(req.body);
    res.status(201).json({ message: await service.sendMessage(req.user!.id, id, input) });
  }),
);
