import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face inference client with the API key
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');

export async function translateCommitMessage(technicalMessage: string): Promise<string> {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('No HUGGINGFACE_API_KEY found, returning raw message for development.');
    return `[Mock AI Translation]: ${technicalMessage}`;
  }

  try {
    const prompt = `
      You are an expert technical translator working for a software agency. 
      Your task is to take a raw technical git commit message and translate it into a short, 
      professional, and client-friendly update that a non-technical business owner would understand and appreciate.
      
      Keep it brief (1-2 sentences). Focus on the business value or user benefit.
      Do not use jargon like 'refactored', 'API endpoint', 'regex', etc.
      
      Raw Commit Message:
      "${technicalMessage}"
      
      Client-Friendly Update:
    `;

    // Using a suitable text generation model on Hugging Face (e.g., mistralai/Mistral-7B-Instruct-v0.2 or similar)
    const result = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.3,
        return_full_text: false,
      }
    });

    return result.generated_text.trim();
  } catch (error) {
    console.error('Error translating commit message:', error);
    return 'System update completed successfully.';
  }
}
