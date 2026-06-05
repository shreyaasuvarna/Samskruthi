import Doubt from '../models/DoubtSchema.js';
import User from '../models/UserSchema.js';
import Chat from '../models/ChatSchema.js';
import { getGeminiReply } from '../utils/gemini.js';

/* ============================================================
   GET ALL DOUBTS (Student sees his doubts, teacher sees assigned)
   ============================================================ */
export const getDoubts = async (req, res) => {
  try {
    console.log('--- getDoubts Start ---');
    console.log('User:', req.user);

    const filter = {};

    if (req.query.student) {
      filter.student = req.query.student;

    } else if (req.user.typeOfUser === 'Student') {
      filter.student = req.user._id;

    } else if (req.user.typeOfUser === 'Teacher') {
      filter.teachers = { $in: [req.user._id] }; // FIXED
    }

    console.log('Filter:', filter);

    const doubts = await Doubt.find(filter)
      .populate('student', 'name email')
      .populate('chat')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found doubts:', doubts.length);
    console.log('--- getDoubts End ---');

    return res.json(doubts);

  } catch (err) {
    console.error('getDoubts error', err);
    return res.status(500).json({ message: 'Failed to fetch doubts' });
  }
};


/* ============================================================
   CREATE DOUBT (Always assign logged-in student)
   ============================================================ */
export const createDoubt = async (req, res) => {
  try {
    const { subject, title, description, teachers } = req.body;

    if (!subject || !title || !description) {
      return res.status(400).json({ message: 'subject, title and description are required' });
    }

    // ALWAYS use logged-in student
    const student = req.user._id;

    // Convert teachers array if provided
    const teacherIds = [];
    if (Array.isArray(teachers)) {
      teachers.forEach(id => {
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          teacherIds.push(id);
        }
      });
    }

    // Create doubt
    const doubt = await Doubt.create({
      subject,
      title,
      description,
      student,
      teachers: teacherIds,
      isGroup: false
    });

    // Create chat if teachers provided
    if (teacherIds.length > 0) {
      const chat = await Chat.create({
        student,
        teachers: teacherIds,
        chatName: `Doubt: ${title}`,
      });

      doubt.chat = chat._id;
      await doubt.save();
    }

    // Send immediate response — AI will update later
    res.status(201).json(doubt);

    // Background AI generation
    try {
      const prompt = `
A student asked a doubt in ${subject}:

Title: ${title}
Description: ${description}

Provide a detailed markdown explanation.
      `;

      const aiReply = await getGeminiReply(prompt);

      await Doubt.findByIdAndUpdate(doubt._id, { aiReply });

    } catch (aiErr) {
      console.error("Gemini AI error (non-fatal):", aiErr.message);
    }

  } catch (err) {
    console.error('createDoubt error', err);
    return res.status(500).json({ message: 'Failed to create doubt' });
  }
};


/* ============================================================
   GET UNASSIGNED DOUBTS (Teacher Dashboard)
   ============================================================ */
export const getUnassignedDoubts = async (req, res) => {
  try {
    if (req.user.typeOfUser !== 'Teacher') {
      return res.status(403).json({ message: 'Only teachers can access unassigned doubts.' });
    }

    const teacherSubjects = req.user.subjects || [];

    if (teacherSubjects.length === 0) {
      return res.json([]);
    }

    const query = {
      subject: { $in: teacherSubjects },
      teachers: { $size: 0 }
    };

    const doubts = await Doubt.find(query)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(doubts);

  } catch (err) {
    console.error('getUnassignedDoubts error', err);
    return res.status(500).json({ message: 'Failed to fetch unassigned doubts' });
  }
};


/* ============================================================
   ACCEPT DOUBT (Teacher clicks accept)
   ============================================================ */
export const acceptDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (req.user.typeOfUser !== 'Teacher') {
      return res.status(403).json({ message: 'Only teachers can accept doubts.' });
    }

    const teacherId = req.user._id;

    // Add teacher if not present
    if (!doubt.teachers.includes(teacherId)) {
      doubt.teachers.push(teacherId);
    }

    // Chat handling
    if (doubt.chat) {
      const chat = await Chat.findById(doubt.chat);
      if (chat && !chat.teachers.includes(teacherId)) {
        chat.teachers.push(teacherId);
        await chat.save();
      }
    } else {
      const newChat = await Chat.create({
        student: doubt.student,
        teachers: [teacherId],
        chatName: `Doubt: ${doubt.title}`,
      });

      doubt.chat = newChat._id;
    }

    await doubt.save();

    const populated = await Doubt.findById(doubt._id)
      .populate('student', 'name email')
      .populate('chat')
      .lean();

    return res.json(populated);

  } catch (err) {
    console.error('acceptDoubt error', err);
    return res.status(500).json({ message: 'Failed to accept doubt' });
  }
};
