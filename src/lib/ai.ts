export async function translateCommitMessage(technicalMessage: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return technicalMessage;
  }

  try {
    const prompt = `You are a premium software agency's Strategy Director. 
    Translate the following technical developer commit message into a high-impact, outcome-driven business update for a VIP client.
    
    THE "VALUE" LAYER (RULES):
    1. Tone: Strategic, elite, and business-focused.
    2. Rule: Map every technical action to a BUSINESS OUTCOME (ROI, speed, cost, or reliability).
    3. Replace "Fixed bug" with "Hardened system architecture to prevent downtime and protect revenue streams".
    4. Replace "Improved speed" with "Optimized backend throughput to accelerate user workflows and increase conversion potential".
    5. Replace "Update API" with "Architected advanced integration points to future-proof scaling operations".
    6. Never use technical jargon.
    7. Keep it under 18 words.
    8. Output ONLY the translated text.

    TECHNICAL MESSAGE: "${technicalMessage}"
    
    STRATEGIC BUSINESS UPDATE:`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
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
            temperature: 0.6,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) throw new Error(`HF Error: ${response.status}`);

    const result = await response.json();
    let text = result[0]?.generated_text || '';
    
    // Clean formatting artifacts
    return text.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, ' ');

  } catch (error) {
    console.error('AI Translation Error:', error);
    const fallbacks = [
      "Hardened core system architecture to ensure peak operational reliability and data integrity.",
      "Optimized platform throughput to accelerate user workflows and protect conversion performance.",
      "Refined high-impact interface elements to drive user engagement and platform retention."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export async function generateReportSummary(
  type: 'weekly' | 'monthly',
  commitMessages: string[]
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || commitMessages.length === 0) {
    return "Consolidated strategic system improvements to enhance platform scalability and operational efficiency.";
  }

  try {
    const prompt = `You are a premium software agency's Lead Strategy Architect.
    Generate a ${type} executive ROI summary for a VIP client based on the following project outcomes.
    
    STRATEGIC IMPACT RULES:
    1. Tone: Reassuring, strategic, and high-impact.
    2. Focus on how these updates impact the client's BOTTOM LINE (conversion, retention, security, or cost-savings).
    3. If weekly: One concise, powerful paragraph (max 3 sentences). Connect engineering wins to business stability.
    4. If monthly: Two detailed paragraphs summarizing strategic milestones, platform health, and long-term value preservation.
    5. Clean formatting: NO newline characters in the output.
    6. Output ONLY the summary text.

    PROJECT OUTCOMES:
    ${commitMessages.map(m => `- ${m}`).join('\n')}

    ${type.toUpperCase()} STRATEGIC SUMMARY:`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: type === 'weekly' ? 120 : 300,
            temperature: 0.5,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) throw new Error(`HF Error: ${response.status}`);

    const result = await response.json();
    let text = result[0]?.generated_text || '';
    
    return text.trim().replace(/\\n/g, ' ') || "Successfully executed a series of high-impact system optimizations to drive platform performance and ensure long-term business continuity.";

  } catch (error) {
    console.error('Report Generation Error:', error);
    return "Successfully executed a series of high-impact system optimizations and strategic feature refinements to drive platform performance, enhance security, and ensure long-term business continuity.";
  }
}

export async function generateAIStrategistAdvice(
  recentActivity: string[]
): Promise<string[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || recentActivity.length === 0) return [];

  try {
    const prompt = `Based on these recent high-impact platform updates, identify 3 elite strategic opportunities to accelerate the client's business growth and ROI.
    Focus on market positioning, revenue preservation, and technological competitive advantage.
    
    RECENT STRATEGIC ACTIVITY:
    ${recentActivity.join('\n')}
    
    Output exactly 3 strategic bullet points. No intro. Focus on the "Next Level" of value.`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 150, temperature: 0.6 } }),
      }
    );

    if (!response.ok) return [];
    const result = await response.json();
    const text = result[0]?.generated_text || '';
    return text.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^- /, '').trim());

  } catch (error) {
    return [
      "Leverage recent performance gains to launch a high-speed marketing campaign targeting enterprise clients.",
      "Utilize the hardened system stability to explore more complex, high-value feature integrations.",
      "Review conversion data post-optimization to refine the long-term product roadmap for maximum ROI."
    ];
  }
}
