import mongoose from 'mongoose';

const feedbackSessionSchema = new mongoose.Schema({
  anonymousToken: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String },
  conversation: [{
    role: { type: String, enum: ['system', 'user', 'assistant'] },
    content: { type: String }
  }],
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('FeedbackSession', feedbackSessionSchema);
