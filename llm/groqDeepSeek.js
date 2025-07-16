import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function generateAnswer(question, contextChunks) {
    const context = contextChunks.join('\n\n');

    const prompt = `
Context:
${context}

Question:
${question}

Answer as clearly as possible based only on the context.
    `;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'deepseek-r1-distill-llama-70b',
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from Groq API');
    }

    return response.data.choices[0].message.content.trim();
}
