// DOM Elements
const tabLinks = document.querySelectorAll('.sidebar li');
const tabContents = document.querySelectorAll('.tab-content');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const newPostModal = document.getElementById('new-post-modal');
const createEventModal = document.getElementById('create-event-modal');
const postRequirementModal = document.getElementById('post-requirement-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const newPostBtn = document.getElementById('new-post-btn');
const createEventBtn = document.getElementById('create-event-btn');
const postRequirementBtn = document.getElementById('post-requirement-btn');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const attachImageBtn = document.getElementById('attach-image-btn');
const imageUpload = document.getElementById('image-upload');
const chatMessages = document.getElementById('chat-messages');
const eventsList = document.getElementById('events-list');
const artistsGrid = document.getElementById('artists-grid');
const requirementsList = document.getElementById('requirements-list');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const userAvatar = document.getElementById('user-avatar');
const onlineUsersList = document.getElementById('online-users');

// State
let currentUser = null;
let socket = null;

// Initialize the application
function init() {
    setupEventListeners();
    checkAuthStatus();
    loadInitialData();
}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Auth buttons
    loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
    registerBtn.addEventListener('click', () => registerModal.style.display = 'block');
    logoutBtn.addEventListener('click', logout);

    // Close modals
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // New post/event/requirement buttons
    newPostBtn.addEventListener('click', () => newPostModal.style.display = 'block');
    createEventBtn.addEventListener('click', () => createEventModal.style.display = 'block');
    postRequirementBtn.addEventListener('click', () => postRequirementModal.style.display = 'block');

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('new-post-form').addEventListener('submit', handleNewPost);
    document.getElementById('create-event-form').addEventListener('submit', handleCreateEvent);
    document.getElementById('post-requirement-form').addEventListener('submit', handlePostRequirement);

    // Chat functionality
    sendMessageBtn.addEventListener('click', sendMessage);
    attachImageBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Switch between tabs
function switchTab(tabId) {
    tabLinks.forEach(link => link.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`li[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Check authentication status
function checkAuthStatus() {
    // In a real app, this would check with the server
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token with server (mock for now)
        currentUser = {
            username: localStorage.getItem('username') || 'User',
            avatar: localStorage.getItem('avatar') || 'default-avatar.png'
        };
        updateAuthUI(true);
        connectWebSocket();
    } else {
        updateAuthUI(false);
    }
}

// Update UI based on auth status
function updateAuthUI(isLoggedIn) {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = currentUser.username;
        userAvatar.src = currentUser.avatar;
        
        // Enable features for logged-in users
        newPostBtn.disabled = false;
        createEventBtn.disabled = false;
        postRequirementBtn.disabled = false;
        messageInput.disabled = false;
        sendMessageBtn.disabled = false;
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
        
        // Disable features for guests
        newPostBtn.disabled = true;
        createEventBtn.disabled = true;
        postRequirementBtn.disabled = true;
        messageInput.disabled = true;
        sendMessageBtn.disabled = true;
    }
}

// Connect to WebSocket for real-time updates
function connectWebSocket() {
    // In a real app, this would connect to your WebSocket server
    console.log('Connecting to WebSocket...');
    // Mock connection
    socket = {
        send: (data) => console.log('WebSocket message sent:', data),
        close: () => console.log('WebSocket closed')
    };
    
    // Simulate receiving messages
    setInterval(() => {
        if (Math.random() > 0.7) {
            const mockUsers = ['Actor1', 'Director1', 'Playwright1', 'Designer1'];
            const mockMessages = [
                "Anyone available for a reading next week?",
                "Check out this new theatre resource I found!",
                "Has anyone worked with this director before?",
                "Looking for recommendations for a lighting designer"
            ];
            
            const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
            
            addMessageToChat({
                user: randomUser,
                content: randomMessage,
                timestamp: new Date().toISOString(),
                type: 'general'
            });
        }
    }, 10000);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // In a real app, this would call your API
        console.log('Logging in with:', username, password);
        
        // Mock login
        currentUser = {
            username: username,
            avatar: 'default-avatar.png'
        };
        
        // Mock API response
        const mockResponse = {
            token: 'mock-jwt-token',
            user: currentUser
        };
        
        // Store auth data
        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('username', mockResponse.user.username);
        localStorage.setItem('avatar', mockResponse.user.avatar);
        
        // Update UI
        updateAuthUI(true);
        loginModal.style.display = 'none';
        connectWebSocket();
        
        // Show welcome message
        addSystemMessage(`Welcome back, ${username}!`);
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const displayName = document.getElementById('reg-display-name').value || username;
    const bio = document.getElementById('reg-bio').value;
    const avatarFile = document.getElementById('reg-avatar').files[0];
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        // In a real app, this would call your API
        console.log('Registering with:', { username, email, displayName, bio });
        
        // Mock registration
        currentUser = {
            username: displayName,
            avatar: avatarFile ? URL.createObjectURL(avatarFile) : 'default-avatar.png'
        };
        
        // Mock API response
        const mockResponse = {
            token: 'mock-jwt-token',
            user: currentUser
        };
        
        // Store auth data
        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('username', mockResponse.user.username);
        localStorage.setItem('avatar', mockResponse.user.avatar);
        
        // Update UI
        updateAuthUI(true);
        registerModal.style.display = 'none';
        connectWebSocket();
        
        // Show welcome message
        addSystemMessage(`Welcome to the community, ${displayName}!`);
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

// Handle logout
function logout() {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    
    // Close WebSocket
    if (socket) {
        socket.close();
        socket = null;
    }
    
    // Reset state
    currentUser = null;
    
    // Update UI
    updateAuthUI(false);
    
    // Show goodbye message
    addSystemMessage('You have been logged out.');
}

// Handle new post
async function handleNewPost(e) {
    e.preventDefault();
    const postType = document.getElementById('post-type').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    if (!content.trim()) {
        alert('Please enter some content for your post');
        return;
    }
    
    try {
        // In a real app, this would call your API
        console.log('Creating new post:', { postType, content, imageFile });
        
        // Create message object
        const message = {
            user: currentUser.username,
            content: content,
            timestamp: new Date().toISOString(),
            type: postType,
            image: imageFile ? URL.createObjectURL(imageFile) : null
        };
        
        // Add to chat
        addMessageToChat(message);
        
        // Clear form
        e.target.reset();
        newPostModal.style.display = 'none';
    } catch (error) {
        alert('Failed to create post: ' + error.message);
    }
}

// Handle create event
async function handleCreateEvent(e) {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value;
    const imageFile = document.getElementById('event-image').files[0];
    
    if (!title || !description || !date || !location) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // In a real app, this would call your API
        console.log('Creating new event:', { title, description, date, location, imageFile });
        
        // Create event object
        const event = {
            title: title,
            description: description,
            date: date,
            location: location,
            organizer: currentUser.username,
            image: imageFile ? URL.createObjectURL(imageFile) : null,
            createdAt: new Date().toISOString()
        };
        
        // Add to events list
        addEventToList(event);
        
        // Clear form
        e.target.reset();
        createEventModal.style.display = 'none';
    } catch (error) {
        alert('Failed to create event: ' + error.message);
    }
}

// Handle post requirement
async function handlePostRequirement(e) {
    e.preventDefault();
    const title = document.getElementById('requirement-title').value;
    const description = document.getElementById('requirement-description').value;
    const contact = document.getElementById('requirement-contact').value;
    const deadline = document.getElementById('requirement-deadline').value;
    
    if (!title || !description || !contact) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // In a real app, this would call your API
        console.log('Posting requirement:', { title, description, contact, deadline });
        
        // Create requirement object
        const requirement = {
            title: title,
            description: description,
            contact: contact,
            deadline: deadline,
            postedBy: currentUser.username,
            postedAt: new Date().toISOString()
        };
        
        // Add to requirements list
        addRequirementToList(requirement);
        
        // Clear form
        e.target.reset();
        postRequirementModal.style.display = 'none';
    } catch (error) {
        alert('Failed to post requirement: ' + error.message);
    }
}

// Send chat message
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    // In a real app, this would send via WebSocket
    const message = {
        user: currentUser.username,
        content: content,
        timestamp: new Date().toISOString(),
        type: 'general'
    };
    
    addMessageToChat(message);
    
    // Clear input
    messageInput.value = '';
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, this would upload to server
    const reader = new FileReader();
    reader.onload = (event) => {
        const message = {
            user: currentUser.username,
            content: 'Shared an image',
            timestamp: new Date().toISOString(),
            type: 'resource',
            image: event.target.result
        };
        
        addMessageToChat(message);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
}

// Add message to chat
function addMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    let imageHtml = '';
    if (message.image) {
        imageHtml = `<img src="${message.image}" class="message-image" alt="Shared image">`;
    }
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-user">${message.user}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="message-content">${message.content}</div>
        ${imageHtml}
        <div class="message-actions">
            <span class="message-action">Like</span>
            <span class="message-action">Reply</span>
            <span class="message-action">Share</span>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add system message to chat
function addSystemMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message';
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add event to events list
function addEventToList(event) {
    const eventElement = document.createElement('div');
    eventElement.className = 'event-card';
    
    let imageHtml = '';
    if (event.image) {
        imageHtml = `<img src="${event.image}" class="event-image" alt="Event image">`;
    }
    
    eventElement.innerHTML = `
        <h3 class="event-title">${event.title}</h3>
        <div class="event-meta">
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
            <span><i class="fas fa-user"></i> ${event.organizer}</span>
        </div>
        <p class="event-description">${event.description}</p>
        ${imageHtml}
        <div class="event-actions">
            <span class="event-action">Interested</span>
            <span class="event-action">Share</span>
        </div>
    `;
    
    eventsList.prepend(eventElement);
}

// Add requirement to requirements list
function addRequirementToList(requirement) {
    const requirementElement = document.createElement('div');
    requirementElement.className = 'requirement-card';
    
    let deadlineHtml = '';
    if (requirement.deadline) {
        deadlineHtml = `<div class="requirement-deadline">Deadline: ${requirement.deadline}</div>`;
    }
    
    requirementElement.innerHTML = `
        <h3 class="requirement-title">${requirement.title}</h3>
        <div class="requirement-meta">
            <span>Posted by: ${requirement.postedBy}</span>
            <span>${formatTime(requirement.postedAt)}</span>
        </div>
        <p class="requirement-description">${requirement.description}</p>
        <div class="requirement-contact">Contact: ${requirement.contact}</div>
        ${deadlineHtml}
    `;
    
    requirementsList.prepend(requirementElement);
}

// Load initial data
function loadInitialData() {
    // Mock data for demo purposes
    const mockMessages = [
        {
            user: 'System',
            content: 'Welcome to the Theatre Artist Community! Start by introducing yourself.',
            timestamp: new Date().toISOString(),
            type: 'system'
        },
        {
            user: 'StageManager1',
            content: 'Looking for a lighting designer for an upcoming production of Hamlet. Any recommendations?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'question'
        },
        {
            user: 'ActorPro',
            content: 'Check out this great resource for monologues!',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'resource',
            image: 'https://via.placeholder.com/300x200?text=Monologue+Resource'
        }
    ];
    
    const mockEvents = [
        {
            title: 'Shakespeare in the Park',
            description: 'Annual outdoor performance of A Midsummer Night\'s Dream. Open to all community members.',
            date: '2023-07-15T19:00',
            location: 'Central Park Amphitheater',
            organizer: 'CommunityTheatreGroup',
            image: 'https://via.placeholder.com/300x200?text=Shakespeare+Event',
            createdAt: new Date().toISOString()
        },
        {
            title: 'Audition Workshop',
            description: 'Learn techniques to improve your audition performance. Led by professional casting director.',
            date: '2023-06-25T14:00',
            location: 'Downtown Arts Center',
            organizer: 'TheatreEducationOrg',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    const mockArtists = [
        {
            name: 'Actor1',
            bio: 'Classically trained actor with 10 years of experience in Shakespearean theatre.',
            status: 'online',
            avatar: 'https://via.placeholder.com/150?text=Actor1'
        },
        {
            name: 'Director1',
            bio: 'Specializing in contemporary works and new play development.',
            status: 'offline',
            avatar: 'https://via.placeholder.com/150?text=Director1'
        },
        {
            name: 'Designer1',
            bio: 'Lighting and set designer with focus on immersive theatre experiences.',
            status: 'online',
            avatar: 'https://via.placeholder.com/150?text=Designer1'
        }
    ];
    
    const mockRequirements = [
        {
            title: 'Need Actors for Romeo & Juliet',
            description: 'Community theatre production seeking actors for all roles. Rehearsals begin July 1st.',
            contact: 'email@communitytheatre.com',
            deadline: '2023-06-30',
            postedBy: 'CommunityTheatre',
            postedAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            title: 'Seeking Playwright for Collaboration',
            description: 'Experimental theatre group looking for playwright to develop new work about urban life.',
            contact: 'experimental@theatre.org',
            postedBy: 'ExperimentalGroup',
            postedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    // Add mock data to UI
    mockMessages.forEach(addMessageToChat);
    mockEvents.forEach(addEventToList);
    mockArtists.forEach(addArtistToDirectory);
    mockRequirements.forEach(addRequirementToList);
    
    // Add mock online users
    updateOnlineUsers(['Actor1', 'Designer1', 'Playwright1', 'StageManager2']);
}

// Add artist to directory
function addArtistToDirectory(artist) {
    const artistElement = document.createElement('div');
    artistElement.className = 'artist-card';
    
    artistElement.innerHTML = `
        <img src="${artist.avatar}" class="artist-avatar" alt="${artist.name}">
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-bio">${artist.bio}</p>
        <div>
            <span class="artist-status ${artist.status}"></span>
            ${artist.status === 'online' ? 'Online' : 'Offline'}
        </div>
    `;
    
    artistsGrid.appendChild(artistElement);
}

// Update online users list
function updateOnlineUsers(users) {
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.innerHTML = `
            <span class="user-status online"></span>
            ${user}
        `;
        onlineUsersList.appendChild(userElement);
    });
}

// Helper function to format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);