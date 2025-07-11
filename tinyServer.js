// api/query.js
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pine = new Pinecone(process.env.PINECONE_API_KEY);
const index = pine.Index("rag2riches");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { question } = req.body;

  // 1) semantic search
  const search = await index.search({
    namespace: "default",
    query: { inputs: { text: question }, top_k: 8 },
    include_metadata: true,
  });
  const hits = search.result.hits;
  if (!hits.length) return res.json({ answer: "No data found." });

  // 2) build context
  const context = hits
    .map(h => `${h.fields.text.slice(0,200)}… (source: ${h.fields.source})`)
    .join("\n\n---\n\n");

  // 3) prompt the model
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      { role: "system", content: "You’re a friendly WSU academic advisor. Use only the context." },
      { role: "user", content: `Context:\n${context}\n\nQ: ${question}` }
    ]
  });

  res.json({ answer: chat.choices[0].message.content });
}