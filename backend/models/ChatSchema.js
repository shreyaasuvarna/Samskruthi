import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  // Optional chat name
  chatName: {
    type: String,
    trim: true
  },

  // The one student in the chat
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The teachers in this chat
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],

  // Latest message (for preview)
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// ✅ Validation: ensure roles are correct
ChatSchema.pre('save', async function (next) {
  const User = mongoose.model('User');

  // Verify student is a Student
  const studentUser = await User.findById(this.student);
  if (!studentUser || studentUser.typeOfUser !== 'Student') {
    return next(new Error('The "student" must reference a Student user.'));
  }

  // Verify all teachers are Teachers
  const teacherUsers = await User.find({ _id: { $in: this.teachers } });
  const invalidTeachers = teacherUsers.filter(u => u.typeOfUser !== 'Teacher');
  if (invalidTeachers.length > 0) {
    return next(new Error('All users in "teachers" must be Teachers.'));
  }

  next();
});

// 🔄 After saving: sync teachers' connected students list
ChatSchema.post('save', async function (doc) {
  const User = mongoose.model('User');

  // For each teacher, add this student if not already connected
  await Promise.all(doc.teachers.map(async (teacherId) => {
    const teacher = await User.findById(teacherId);

    if (teacher) {
      // Initialize array if needed
      if (!Array.isArray(teacher.studentsConnected)) {
        teacher.studentsConnected = [];
      }

      // Add student only if not already added
      if (!teacher.studentsConnected.includes(doc.student)) {
        teacher.studentsConnected.push(doc.student);
        await teacher.save();
      }
    }
  }));
});

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
