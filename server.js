// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const Booking = require("./models/Booking");
const Show = require("./models/Show");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/ticketing")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Admin Schema
const adminSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String });
const Admin = mongoose.model("Admin", adminSchema);

// Artist Schema
const artistSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String });
const Artist = mongoose.model("Artist", artistSchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
  title: String,
  messages: [{ role: String, content: String }]
});
const Chat = mongoose.model("Chat", chatSchema);

// Admin Routes
app.post("/api/admin/signup", async (req, res) => { /* ... */ });
app.post("/api/admin/login", async (req, res) => { /* ... */ });
app.get("/api/admins", async (req, res) => { /* ... */ });

// Artist Routes
app.post("/api/artist/signup", async (req, res) => { /* ... */ });
app.post("/api/artist/login", async (req, res) => { /* ... */ });
app.get("/api/artists", async (req, res) => { /* ... */ });
app.get("/api/artist/shows", async (req, res) => { /* ... */ });
app.post("/api/artist/change-password", async (req, res) => { /* ... */ });

// User Routes
app.post("/api/user/signup", async (req, res) => { /* ... */ });
app.post("/api/user/login", async (req, res) => { /* ... */ });
app.get("/api/user/profile", async (req, res) => { /* ... */ });
app.post("/api/user/change-password", async (req, res) => { /* ... */ });
app.get("/api/users", async (req, res) => { const users = await User.find(); res.json(users); });

// Show Routes
app.post("/api/shows", upload.single("image"), async (req, res) => { /* ... */ });
app.get("/api/shows", async (req, res) => { /* ... */ });
app.put("/api/shows/:id", async (req, res) => { /* ... */ });
app.delete("/api/shows/:id", async (req, res) => { /* ... */ });

// Booking Routes
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

// Chatbot Routes
app.post("/api/chats", async (req, res) => {
  const newChat = new Chat({ title: req.body.title, messages: [] });
  await newChat.save();
  res.status(201).json(newChat);
});

app.get("/api/chats", async (req, res) => {
  const chats = await Chat.find();
  res.json(chats);
});

app.get("/api/chats/:id/messages", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  res.json(chat?.messages || []);
});

app.post("/api/chats/:id/messages", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  chat.messages.push(req.body);
  await chat.save();
  res.status(201).json({ success: true });
});

app.post("/api/chat/respond", async (req, res) => {
  const { message, chatId } = req.body;
  const chat = await Chat.findById(chatId);
  const aiResponse = `Echo: ${message}`;
  chat.messages.push({ role: "assistant", content: aiResponse });
  await chat.save();
  res.json({ response: aiResponse });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
