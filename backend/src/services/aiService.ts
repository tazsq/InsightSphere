import { GoogleGenAI } from '@google/genai';

// Lazily initialize the Google Gen AI SDK
let aiClient: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

export const generateChatResponse = async (conversation: any[]): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Using mocked response.");
      return "Thank you for sharing that. Could you elaborate a bit more on how it impacted your semester?";
    }

    const ai = getAiClient();

    // Convert our conversation format to what the Gemini API expects
    // The SDK chat interface expects 'user' or 'model' roles.
    const history = conversation
      .filter(msg => msg.role !== 'system') // Typically system prompts are handled differently or pre-pended to the first user message
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const systemInstruction = conversation.find(msg => msg.role === 'system')?.content || '';
      'You are an empathetic, professional AI Dean Assistant conducting a guided feedback interview with a student. Ask one question at a time. Be concise.';

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        }
    });

    return response.text || "Thank you. Can you tell me more?";
  } catch (error) {
    console.error("AI Chat Generation Error:", error);
    return "I appreciate your feedback. Let's move on to the next question.";
  }
};

export const analyzeFeedbackSession = async (conversation: any[]): Promise<any> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
       // Return mocked analytics if no key
       return {
         sentiment: 'Neutral',
         topics: ['General Feedback'],
         authenticityScore: 85,
         summary: 'The student provided general feedback about the semester.'
       };
    }

    const transcript = conversation
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Student'}: ${msg.content}`)
      .join('\n\n');

    const ai = getAiClient();

    const prompt = `
      Analyze the following student feedback interview transcript. 
      Extract the following information and return ONLY a valid JSON object:
      - sentiment: "Positive", "Neutral", or "Negative" (overall sentiment of the student)
      - topics: An array of strings representing key topics discussed (e.g., "Teaching Quality", "Facilities", "Workload")
      - authenticityScore: A number from 0 to 100 representing how thoughtful and genuine the student's responses appear.
      - summary: A 2-3 sentence summary of the core issues or praises raised by the student.

      Transcript:
      ${transcript}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      sentiment: 'Neutral',
      topics: ['Error analyzing'],
      authenticityScore: 50,
      summary: 'An error occurred during AI analysis.'
    };
  }
};

export const queryDeanAssistant = async (query: string, dataContext: any): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "This is a mocked response from the AI Dean Assistant. Please configure your GEMINI_API_KEY to get real insights.";
    }

    const prompt = `
      You are the "AI Dean Assistant", an expert educational data analyst.
      An administrator has asked you the following question: "${query}"

      Here is the current analytics data for the institution:
      ${JSON.stringify(dataContext)}

      Provide a concise, highly professional, and insightful answer based ONLY on this data. Use bullet points if necessary.
    `;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.3 }
    });

    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Dean Assistant Error:", error);
    return "Error generating insight. Please try again.";
  }
};
