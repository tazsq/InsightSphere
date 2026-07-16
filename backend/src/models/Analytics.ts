import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackSession', required: true },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
  topics: [{ type: String }],
  authenticityScore: { type: Number, min: 0, max: 100 },
  summary: { type: String }
}, { timestamps: true });

export default mongoose.model('Analytics', analyticsSchema);
