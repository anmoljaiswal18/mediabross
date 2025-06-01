const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the root (like assets, vendor)
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "vendor")));

// Serve the index.html file for GET /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// MongoDB connection
mongoose.connect(
  "mongodb+srv://jaiswalanmol1151:Sx9DOE7MK5nZi1Vp@cluster0.qcjvgvp.mongodb.net/mediabross?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema);

// Contact route
app.post("/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send("✅ Message saved successfully!");
  } catch (error) {
    console.error("❌ Error saving message:", error);
    res.status(500).send("Error saving message");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
