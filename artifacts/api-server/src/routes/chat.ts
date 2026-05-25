import { Router } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/chat/messages", async (req, res) => {
  try {
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .orderBy(desc(chatMessagesTable.createdAt))
      .limit(50);
    res.json(messages.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to fetch chat messages");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/chat/messages", async (req, res) => {
  try {
    const { username, content, attachmentUrl, attachmentType } = req.body;
    if (!username || !content) {
      return res.status(400).json({ error: "username and content are required" });
    }
    const [message] = await db
      .insert(chatMessagesTable)
      .values({ username, content, attachmentUrl: attachmentUrl || null, attachmentType: attachmentType || null })
      .returning();
    res.status(201).json(message);
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
