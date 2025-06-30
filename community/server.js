require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/theatre_community', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Message = require('./models/Message');
const Event = require('./models/Event');
const Requirement = require('./models/Requirement');

// File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, displayName, bio } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        user = new User({
            username,
            email,
            displayName: displayName || username,
            bio
        });
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        
        // Create JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName
            }
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar
            }
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User Routes
app.get('/api/users/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.put('/api/users/me', authenticate, upload.single('avatar'), async (req, res) => {
    try {
        const { displayName, bio } = req.body;
        const updates = {};
        
        if (displayName) updates.displayName = displayName;
        if (bio) updates.bio = bio;
        if (req.file) updates.avatar = `/uploads/${req.file.filename}`;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/users/online', authenticate, async (req, res) => {
    try {
        // In a real app, you'd track online users via WebSocket connections
        const onlineUsers = await User.find().limit(10).select('username displayName avatar');
        res.json(onlineUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Message Routes
app.get('/api/messages', authenticate, async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'username displayName avatar');
        
        res.json(messages.reverse());
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/messages', authenticate, upload.single('image'), async (req, res) => {
    try {
        const { content, type } = req.body;
        
        const message = new Message({
            user: req.user.id,
            content,
            type: type || 'general',
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        
        await message.save();
        
        // Populate user data
        await message.populate('user', 'username displayName avatar');
        
        // Broadcast to all connected clients
        io.emit('newMessage', message);
        
        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Event Routes
app.get('/api/events', authenticate, async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 })
            .populate('organizer', 'username displayName avatar');
        
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/events', authenticate, upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        
        const event = new Event({
            title,
            description,
            date,
            location,
            organizer: req.user.id,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        
        await event.save();
        
        // Populate organizer data
        await event.populate('organizer', 'username displayName avatar');
        
        // Broadcast to all connected clients
        io.emit('newEvent', event);
        
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Requirement Routes
app.get('/api/requirements', authenticate, async (req, res) => {
    try {
        const requirements = await Requirement.find()
            .sort({ postedAt: -1 })
            .populate('postedBy', 'username displayName avatar');
        
        res.json(requirements);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/requirements', authenticate, async (req, res) => {
    try {
        const { title, description, contact, deadline } = req.body;
        
        const requirement = new Requirement({
            title,
            description,
            contact,
            deadline,
            postedBy: req.user.id
        });
        
        await requirement.save();
        
        // Populate postedBy data
        await requirement.populate('postedBy', 'username displayName avatar');
        
        // Broadcast to all connected clients
        io.emit('newRequirement', requirement);
        
        res.json(requirement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join user to their own room for private messages
    socket.on('join', (userId) => {
        socket.join(userId);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));