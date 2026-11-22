export default async function handler(req, res) {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  if (!binId || !apiKey) {
    return res.status(500).json({ error: "Missing JSONBIN_BIN_ID or JSONBIN_API_KEY" });
  }

  const url = `https://api.jsonbin.io/v3/b/${binId}`;

  try {
    if (req.method === "GET") {
      const response = await fetch(`${url}/latest`, {
        headers: { "X-Master-Key": apiKey },
      });
      const data = await response.json();
      return res.status(response.status).json(data.record || data);
    }

    if (req.method === "PUT" || req.method === "POST") {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": apiKey,
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data.record || data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "JSONBin sync failed" });
  }
}

