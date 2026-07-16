import { Request, Response } from 'express';
import Analytics from '../models/Analytics';
import FeedbackSession from '../models/FeedbackSession';

// @desc    Get dashboard KPIs and metrics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSessions = await FeedbackSession.countDocuments();
    const analytics = await Analytics.find();

    const totalAnalyzed = analytics.length;
    
    let positive = 0, neutral = 0, negative = 0;
    let totalScore = 0;
    const topicCounts: Record<string, number> = {};

    analytics.forEach(a => {
      if (a.sentiment === 'Positive') positive++;
      else if (a.sentiment === 'Neutral') neutral++;
      else if (a.sentiment === 'Negative') negative++;

      if (a.authenticityScore) totalScore += a.authenticityScore;

      a.topics.forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    const averageAuthenticity = totalAnalyzed > 0 ? Math.round(totalScore / totalAnalyzed) : 0;
    
    // Calculate department breakdown by joining with FeedbackSession
    // Since we only fetched analytics, we need to populate or join to get department.
    // For simplicity, let's fetch populated analytics:
    const populatedAnalytics = await Analytics.find().populate({ path: 'feedbackId', select: 'department' });
    
    const departmentCounts: Record<string, number> = {};
    populatedAnalytics.forEach(a => {
      const dept = (a.feedbackId as any)?.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const departmentBreakdown = Object.entries(departmentCounts).map(([name, count]) => ({ name, count }));
    
    // Sort topics by frequency
    const topTopics = Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      kpis: {
        totalSessions,
        totalAnalyzed,
        averageAuthenticity,
      },
      sentiment: {
        positive,
        neutral,
        negative
      },
      topTopics,
      departmentBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};

// @desc    Get recent analyzed feedback
// @route   GET /api/analytics/recent
// @access  Private (Admin)
export const getRecentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const recent = await Analytics.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'feedbackId',
        select: 'department semester'
      });

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent feedback', error });
  }
};

// @desc    Ask the AI Dean Assistant a question
// @route   POST /api/analytics/dean-assistant
// @access  Private (Admin)
export const askDeanAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    // Fetch aggregate data to pass to the assistant as context
    const analytics = await Analytics.find().populate({ path: 'feedbackId', select: 'department semester' });
    
    // To prevent exceeding token limits, we pass a summarized view of the data
    const summaryData = analytics.map(a => ({
      sentiment: a.sentiment,
      topics: a.topics,
      authenticityScore: a.authenticityScore,
      department: (a.feedbackId as any)?.department,
      semester: (a.feedbackId as any)?.semester
    }));

    // Import the AI service dynamically
    const { queryDeanAssistant } = require('../services/aiService');
    const answer = await queryDeanAssistant(query, summaryData);

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Error querying dean assistant', error });
  }
};
