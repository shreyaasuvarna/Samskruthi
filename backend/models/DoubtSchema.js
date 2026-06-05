import mongoose from 'mongoose';

// Doubt schema — a focused discussion item raised by a student
const DoubtSchema = new mongoose.Schema({
	subject: {
		type: String,
		required: [true, 'Subject is required'],
		trim: true
	},
	title: {
		type: String,
		required: [true, 'Title is required'],
		trim: true
	},
	description: {
		type: String,
		required: [true, 'Description is required'],
		trim: true
	},
	status: {
		type: String,
		enum: ['pending', 'answered', 'resolved'],
		default: 'pending'
	},
	// The student who raised the doubt
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	// One or more teachers assigned or replying
	teachers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	],
	// If the doubt is discussed as a group
	isGroup: {
		type: Boolean,
		default: false
	},
       // Optional field to reference the latest message/comment
       latestMessage: {
	       type: mongoose.Schema.Types.ObjectId,
	       ref: 'Message'
       },
       // AI reply from Gemini
       aiReply: {
	       type: String,
	       default: ''
       },
       chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
       }
}, {
	timestamps: true
});

// Validate roles: student must be Student and teachers (if any) must be Teachers
DoubtSchema.pre('save', async function (next) {
	const User = mongoose.model('User');

	if (this.student) {
		const studentUser = await User.findById(this.student);
		if (!studentUser || studentUser.typeOfUser !== 'Student') {
			return next(new Error('The "student" must reference a Student user.'));
		}
	}

	if (this.teachers && this.teachers.length > 0) {
		const teacherUsers = await User.find({ _id: { $in: this.teachers } });
		const invalidTeachers = teacherUsers.filter(u => u.typeOfUser !== 'Teacher');
		if (invalidTeachers.length > 0) {
			return next(new Error('All users in "teachers" must be Teachers.'));
		}
	}

	next();
});

const Doubt = mongoose.model('Doubt', DoubtSchema);
export default Doubt;