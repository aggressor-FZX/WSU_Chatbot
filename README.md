 **Semantic Search**: Uses Pinecone to retrieve relevant context from indexed data.
- **OpenAI Chat Completion**: Generates answers using OpenAI's GPT models, grounded in retrieved context.
- **API Endpoint**: Exposes a `/api/query` POST endpoint for question answering.

## File Overview

- `tinyServer.js`: Minimal Node.js API server for handling question-answer requests.
- in another repo: Jupyter notebooks for data collection, subject extraction, and experimentation.
-index.html: Front-end: a single HTML + JS file

## Usage


```

### 2. Running the API Server

```bash
node tinyServer.js
```

### 3. Querying the API
Send a POST request to `/api/query` with a JSON body:

```json
{
  "question": "What are the prerequisites for BIOLOGY 106?"
}
```

### 4. Data Collection

Use the provided notebooks to scrape and process WSU course data, and to experiment with subject extraction and RAG workflows.

## Example API Response

```json
{
  "answer": "BIOLOGY 106 requires BIOLOGY 105 as a prerequisite. (source: catalog.wsu.edu)"
}
```

## License

MIT

---

**Note:** This project is for demonstration and educational purposes. API keys and sensitive data should be kept secure.
