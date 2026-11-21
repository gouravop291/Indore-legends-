export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, password, secretKey } = req.body || {};
    const cleanName = String(name || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();
    const cleanKey = String(secretKey || "").trim();

    if (!cleanName || !cleanPass || !cleanKey) {
      return res.status(400).json({ ok: false, error: "Enter Full Name, Password, and Secret Key." });
    }

    // Set these in Vercel -> Project Settings -> Environment Variables
    // MANDIR_SECRET_KEY example: GANESH2026
    // MANDIR_USERS example (JSON): [{"name":"Gaurav Lalwani","pass":"1234"}]
    const expectedKey = process.env.MANDIR_SECRET_KEY || "GANESH2026";
    let allowedUsers = [
      { name: "Gaurav Lalwani", pass: "1234" },
    ];

    if (process.env.MANDIR_USERS) {
      try {
        const parsed = JSON.parse(process.env.MANDIR_USERS);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allowedUsers = parsed;
        }
      } catch {
        // Fallback if env JSON is malformed
      }
    }

    if (cleanKey !== expectedKey) {
      return res.status(401).json({ ok: false, error: "Invalid Secret Key." });
    }

    const matched = allowedUsers.find(
      (u) =>
        String(u.name || "").trim().toLowerCase() === cleanName &&
        String(u.pass || "").trim() === cleanPass
    );

    if (!matched) {
      return res.status(401).json({ ok: false, error: "Name not authorized or wrong password." });
    }

    return res.status(200).json({
      ok: true,
      memberName: matched.name,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Auth check failed" });
  }
}
