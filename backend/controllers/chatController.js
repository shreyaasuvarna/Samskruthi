import Chat from '../models/ChatSchema.js';
import User from '../models/UserSchema.js';
import Message from '../models/MessageSchema.js';

/**
 * @desc    Create a new chat between a student and one or more teachers
 * @route   POST /api/chats
 * @access  Private (Student)
 */
export const createChat = async (req, res) => {
  try {
    const { chatName, teachers } = req.body;
    const studentId = req.user?._id; // assuming auth middleware attaches req.user

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized — no student ID found.' });
    }

    // Only Students may create chats (students initiate chats with teachers)
    if (req.user.typeOfUser !== 'Student') {
      return res.status(403).json({ message: 'Only students may create chats.' });
    }

    if (!teachers || teachers.length === 0) {
      return res.status(400).json({ message: 'At least one teacher is required.' });
    }

    // 🔍 Ensure teachers exist and have correct role
    const teacherDocs = await User.find({ _id: { $in: teachers }, typeOfUser: 'Teacher' });
    if (teacherDocs.length !== teachers.length) {
      return res.status(400).json({ message: 'One or more provided teachers are invalid.' });
    }

    // 🧠 Check for existing 1:1 chat (avoid duplicates)
    const existing = await Chat.findOne({
      student: studentId,
      teachers: { $size: teachers.length, $all: teachers },
    });

    if (existing) {
      const populated = await Chat.findById(existing._id)
        .populate('student teachers', 'name email typeOfUser')
        .populate({
          path: 'latestMessage',
          populate: { path: 'sender', select: 'name email' },
        });
      return res.status(200).json(populated);
    }

    // 🆕 Create chat
    const newChat = await Chat.create({
      chatName: chatName || `Chat with ${teacherDocs[0]?.name || 'Teacher'}`,
      student: studentId,
      teachers,
    });

    // 🔄 Populate for frontend
    const populatedChat = await Chat.findById(newChat._id)
      .populate('student teachers', 'name email typeOfUser')
      .populate('latestMessage');

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error('❌ Error creating chat:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Fetch all chats for logged-in user (student or teacher)
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ student: userId }, { teachers: userId }],
    })
      .populate({
        path: 'student teachers',
        select: 'name email typeOfUser'
      })
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name email' }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error('❌ Error fetching chats:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get a single chat by ID
 * @route   GET /api/chats/:chatId
 * @access  Private
 */
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate('student teachers', 'name email typeOfUser')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name email' },
      });

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Ensure user belongs to chat
    const isMember =
      String(chat.student._id) === String(userId) ||
      chat.teachers.some((t) => String(t._id) === String(userId));

    if (!isMember)
      return res.status(403).json({ message: 'You are not a member of this chat' });

    res.status(200).json(chat);
  } catch (err) {
    console.error('❌ Error fetching chat by ID:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Delete a chat (student only)
 * @route   DELETE /api/chats/:chatId
 * @access  Private (Student)
 */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Only the student who owns the chat can delete it
    if (String(chat.student) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this chat' });
    }

    // Delete related messages
    await Message.deleteMany({ chat: chatId });
    await chat.deleteOne();

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting chat:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Fetch all messages for a chat
 * @route   GET /api/chats/:chatId/messages
 * @access  Private
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Ensure user is part of chat
    const isMember =
      String(chat.student) === String(userId) ||
      chat.teachers.some((t) => String(t) === String(userId));

    if (!isMember)
      return res.status(403).json({ message: 'Access denied: not a participant' });

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email typeOfUser')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Error fetching chat messages:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Send a new message in a chat
 * @route   POST /api/chats/:chatId/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || !chatId)
      return res.status(400).json({ message: 'Invalid message data' });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Ensure user belongs to chat
    const isMember =
      String(chat.student) === String(senderId) ||
      chat.teachers.some((t) => String(t) === String(senderId));

    if (!isMember)
      return res.status(403).json({ message: 'You are not part of this chat' });

    const message = await Message.create({
      sender: senderId,
      content,
      chat: chatId,
    });

    // Update chat’s latest message
    chat.latestMessage = message._id;
    await chat.save();

    // Populate message with consistent fields
    const populated = await Message.findById(message._id)
      .populate('sender', 'name email typeOfUser')
      .populate('chat');
    
    console.log('✅ Message sent:', { messageId: populated._id, content, sender: senderId });
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Error sending message:', err);
    res.status(500).json({ message: err.message });
  }
};

export default {
  createChat,
  getChats,
  getChatById,
  deleteChat,
  getChatMessages,
  sendMessage,
};