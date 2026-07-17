import { Request, Response } from 'express';
import FeedbackSession from '../models/FeedbackSession';
import Analytics from '../models/Analytics';
import crypto from 'crypto';
import { generateChatResponse, analyzeFeedbackSession } from '../services/aiService';

// @desc    Start a new anonymous feedback session
// @route   POST /api/feedback/start
// @access  Private (Student)
export const startSession = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    // Generate a unique anonymous token
    const anonymousToken = crypto.randomBytes(32).toString('hex');
    
    // Create the session disconnected from user ID
    const session = await FeedbackSession.create({
      anonymousToken,
      department: user.department || 'General',
      semester: user.semester || 'N/A',
      conversation: [
        {
          role: 'system',
          content: 'You are an empathetic, professional AI Dean Assistant conducting a guided feedback interview with a student. Ask one question at a time to understand their experience with teaching, facilities, and administration. Keep your responses concise (1-2 sentences).'
        },
        {
          role: 'assistant',
          content: 'Hello! Thank you for taking the time to share your feedback. To start, how would you describe your overall learning experience this semester?'
        }
      ]
    });

    res.status(201).json({
      anonymousToken: session.anonymousToken,
      message: session.conversation[1].content
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting session', error });
  }
};

// @desc    Send a message in an existing session
// @route   POST /api/feedback/chat
// @access  Public (Requires anonymousToken)
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anonymousToken, message } = req.body;
    
    if (!anonymousToken || !message) {
      res.status(400).json({ message: 'Token and message are required' });
      return;
    }

    const session = await FeedbackSession.findOne({ anonymousToken });
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Add user's message
    session.conversation.push({ role: 'user', content: message });

    // Count how many answers the user has provided
    const userMessageCount = session.conversation.filter(msg => msg.role === 'user').length;

    let aiResponse = '';
    let isFinished = false;

    if (userMessageCount >= 5) {
      aiResponse = "Thank you! You have completed the feedback interview. Please click the button below to submit your feedback.";
      isFinished = true;
    } else {
      // Create a copy of the conversation to avoid mutating the database document
      const chatConversation = [...session.conversation];
      
      // If we are about to ask the 5th and final question, instruct the AI to make it the final question
      if (userMessageCount === 4) {
        chatConversation[0] = {
          role: 'system',
          content: (chatConversation[0]?.content || '') + ' This is the 5th and final question. Ask for any final comments or suggestions.'
        };
      }
      
      // Call Gemini API to get the next question
      aiResponse = await generateChatResponse(chatConversation);
    }

    session.conversation.push({ role: 'assistant', content: aiResponse });

    await session.save();

    res.json({ reply: aiResponse, isFinished });
  } catch (error) {
    res.status(500).json({ message: 'Error processing chat', error });
  }
};

// @desc    Submit and finalize the session
// @route   POST /api/feedback/submit
// @access  Public (Requires anonymousToken)
export const submitSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anonymousToken } = req.body;

    const session = await FeedbackSession.findOne({ anonymousToken });
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Add a final message
    session.conversation.push({ role: 'assistant', content: 'Thank you for your valuable feedback! Your session has been submitted anonymously.' });
    session.submittedAt = new Date();
    
    await session.save();

    // Trigger AI Analysis asynchronously (don't await it to prevent blocking the response)
    analyzeFeedbackSession(session.conversation).then(async (analysis) => {
      try {
        await Analytics.create({
          feedbackId: session._id,
          sentiment: analysis.sentiment,
          topics: analysis.topics,
          authenticityScore: analysis.authenticityScore,
          summary: analysis.summary
        });
        console.log(`Analytics saved for session ${session._id}`);
      } catch (err) {
        console.error("Error saving analytics", err);
      }
    });

    res.json({ message: 'Session submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting session', error });
  }
};

