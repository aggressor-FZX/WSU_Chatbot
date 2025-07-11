// api/query.js
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pine   = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index  = pine.Index("rag2riches");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    // only allow POST
    return res.setHeader("Allow", "POST")
              .status(405)
              .json({ error: "Method Not Allowed" });
  }

  // 1) semantic search
 const { question } = req.body;
  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Missing question" });
  }

  // 1) semantic search
  const search = await index.search({
    namespace:       "default",
    query:           { inputs: { text: question }, top_k: 8 },
    include_metadata: true
  });

  const hits = search.result.hits;
  if (!hits.length) {
    return res.json({ answer: "Sorry, I couldn’t find anything relevant." });
  }

  // 2) build your context string
  const context = hits
    .map(h => {
      const txt = h.fields.text.replace(/\s+/g, " ").slice(0, 200) + "…";
      return `• ${txt} (source: ${h.fields.source})`;
    })
    .join("\n");

  // 3) ask OpenAI
  const chat = await openai.chat.completions.create({
    model:       "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role:    "system",
        content: "You’re a friendly WSU academic advisor. Use *only* the context below to answer."
      },
      {
        role:    "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]
  });

  const answer = chat.choices?.[0]?.message?.content ?? "🤖 (no reply?)";
  return res.json({ answer });
}
