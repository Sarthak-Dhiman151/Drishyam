import { GoogleGenAI } from "@google/genai";

const model = 'gemini-2.5-flash';

export const getSceneDescription = async (apiKey: string, base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are Drishyam, an AI assistant. Your purpose is to describe the visual world for people with visual impairments. Analyze the following image from a camera feed and provide a concise, real-time description. Focus on the most important elements: Identify key objects, people (if any, describing their apparent actions or emotions), read any clear text, and summarize the overall scene. Be direct and clear. Example: 'A person is sitting at a wooden desk, typing on a laptop. A red coffee mug is to their right.'`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: prompt,
    };
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.3,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 150,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });

    return response.text?.trim() ?? "Error: Unable to generate a description for the scene.";
  } catch (error) {
    console.error("Error generating scene description:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return 'Error: The provided API Key is invalid. Please check and try again.';
        }
        return `Error: Could not analyze the scene. ${error.message}`;
    }
    return "Error: An unknown error occurred while analyzing the scene.";
  }
};

export const getImageDescription = async (apiKey: string, base64Image: string, userPrompt: string, mimeType: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const finalPrompt = userPrompt.trim()
      ? `You are Drishyam, an AI assistant. Analyze the following image and answer the user's question: "${userPrompt}"`
      : `You are Drishyam, an AI assistant. Your purpose is to describe the visual world. Analyze the following image and provide a concise but detailed description.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    const textPart = { text: finalPrompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.4,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 500,
      }
    });

    return response.text?.trim() ?? "Error: Unable to generate a description for the image.";
  } catch (error) {
    console.error("Error generating image description:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return 'Error: The provided API Key is invalid. Please check and try again.';
        }
        return `Error: Could not analyze the image. ${error.message}`;
    }
    return "Error: An unknown error occurred while analyzing the image.";
  }
};

export const hasSceneChanged = async (apiKey: string, oldBase64Image: string, newBase64Image: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a visual change detector for an accessibility app. Compare the first image (the old scene) with the second image (the new scene). Has the scene changed dramatically enough to warrant a new description for a visually impaired user? Consider major changes in objects, people, or overall environment. Ignore minor shifts, lighting changes, or small movements. Respond with only a single word: 'YES' or 'NO'.`;

        const oldImagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: oldBase64Image,
            },
        };

        const newImagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: newBase64Image,
            },
        };

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [oldImagePart, newImagePart, textPart] },
            config: {
                temperature: 0.1,
                maxOutputTokens: 10,
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster, direct response
            }
        });

        return (response.text ?? '').trim().toUpperCase() === 'YES';

    } catch (error) {
        console.error("Error checking for scene change:", error);
        return false; // Default to false if there's an error to avoid unwanted narrations
    }
};