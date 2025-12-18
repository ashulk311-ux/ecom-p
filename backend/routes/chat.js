const express = require('express');
const Chat = require('../models/Chat');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate('supportAgentId', 'name email');
    
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create chat
router.get('/open', auth, async (req, res) => {
  try {
    let chat = await Chat.findOne({
      userId: req.user._id,
      status: { $in: ['open', 'waiting'] }
    });

    if (!chat) {
      chat = new Chat({
        userId: req.user._id,
        status: 'open',
        messages: [],
        subject: req.query.subject || 'General Inquiry'
      });
      await chat.save();
    }

    await chat.populate('supportAgentId', 'name email');
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('supportAgentId', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/message', auth, async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.status === 'closed') {
      return res.status(400).json({ message: 'Chat is closed' });
    }

    chat.messages.push({
      senderId: req.user._id,
      senderName: req.user.name,
      message,
      type
    });

    chat.lastMessageAt = new Date();
    if (chat.status === 'open' && !chat.supportAgentId) {
      chat.status = 'waiting';
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close chat
router.put('/:id/close', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.status = 'closed';
    chat.closedAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all open chats
router.get('/admin/open', adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ status: { $in: ['open', 'waiting'] } })
      .populate('userId', 'name email')
      .sort({ lastMessageAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Assign chat to agent
router.put('/admin/:id/assign', adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.supportAgentId = req.user._id;
    chat.status = 'open';
    await chat.save();

    await chat.populate('supportAgentId', 'name email');
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Send message as support
router.post('/admin/:id/message', adminAuth, async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.supportAgentId) {
      chat.supportAgentId = req.user._id;
    }

    chat.messages.push({
      senderId: req.user._id,
      senderName: req.user.name,
      message,
      type
    });

    chat.status = 'open';
    chat.lastMessageAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



