// index.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// create transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Mediabross backend" });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }

  // ✅ respond immediately so frontend doesn't hang
  res.status(202).json({ success: true, message: "Accepted — processing in background" });

  // send emails in background (non-blocking)
  (async () => {
    try {
      await transporter.sendMail({
        from: email,
        to: process.env.EMAIL_USER,
        subject: `📩 New Contact from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🎉 Thanks for contacting Mediabross!",
        html: `<p>Thanks ${name}, we received your message.</p>`,
      });

      console.log(`✉️ Emails sent for ${email}`);
    } catch (err) {
      console.error("❌ Email send failed:", err.message || err);
    }
  })();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
