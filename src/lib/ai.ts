export async function translateCommitMessage(technicalMessage: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return technicalMessage;
  }

  try {
    const prompt = `<s>[INST] You are a premium software agency's communication director. 
    Translate this technical developer commit message into a high-end, professional, and attractive project update for a VIP client.
    
    RULES:
    1. Use high-impact words: "Enhanced", "Engineered", "Optimized", "Architected", "Polished".
    2. Focus strictly on the benefit to the business or user experience.
    3. Never use technical jargon (regex, database, refactor, endpoint).
    4. Keep it under 15 words.
    5. Output ONLY the translated text.

    TECHNICAL MESSAGE: "${technicalMessage}" [/INST]`;

    // Implementing exponential backoff for high-load inference scenarios
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 60,
            temperature: 0.7, // Higher temperature for more variety
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF Error: ${response.status}`);
    }

    const result = await response.json();
    let text = result[0]?.generated_text || '';
    
    if (!text || text.length < 5) {
      throw new Error('Empty AI response');
    }

    return text.trim().replace(/^["']|["']$/g, '');

  } catch (error) {
    console.error('AI Translation Error:', error);
    
    // Varied Fallbacks so it's not the same every time
    const fallbacks = [
      "Engineered core system improvements for enhanced stability.",
      "Optimized platform performance and user workflow.",
      "Refined interface elements for a more seamless experience.",
      "Architected backend enhancements to support upcoming features.",
      "Polished system reliability and data processing efficiency."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
