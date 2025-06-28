const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/crowdfundingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const chatSchema = new mongoose.Schema({
  title: String,
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  role: String, // 'user' or 'assistant'
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

// Get all chats
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create a new chat
app.post('/api/chats', async (req, res) => {
  const { title } = req.body;
  try {
    const newChat = new Chat({ title });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Delete a chat
app.delete('/api/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    // Also delete associated messages
    await Message.deleteMany({ chatId });

    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});


// Get messages for a chat
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message to chat
app.post('/api/chats/:chatId/messages', async (req, res) => {
  const { content, role } = req.body;
  try {
    const newMessage = new Message({
      chatId: req.params.chatId,
      content,
      role,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// At top of server.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat/respond', async (req, res) => {
  const { message, chatId } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    const aiMessage = new Message({
      chatId,
      role: 'assistant',
      content: responseText,
    });
    await aiMessage.save();

    res.json({ response: responseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini response failed' });
  }
});


// Start the server
app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
