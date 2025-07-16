import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error('⚠️  GROQ_API_KEY environment variable is not set');
    console.error('   Please add your Groq API key to environment variables');
} else {
    console.log('✅ Groq API key configured');
}

export async function generateAnswer(question, context) {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ API key is not configured');
    }

    if (!question || question.trim().length === 0) {
        throw new Error('Question is required');
    }

    if (!context || context.trim().length === 0) {
        throw new Error('Context is required');
    }

    const prompt = `
Context:
${context}

Question:
${question}

Instructions: Answer the question clearly and concisely based only on the provided context. If the context doesn't contain enough information to answer the question, say so explicitly.
    `;

    try {
        console.log('Generating answer using Groq API...');
        
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'deepseek-r1-distill-llama-70b',
            messages: [
                { role: "system", content: "You are a helpful assistant that answers questions based strictly on the provided context." },
                { role: "user", content: prompt }
            ],
            max_tokens: 800, // Reduced for better performance
            temperature: 0.1,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'PDF-AI-Server/1.0'
            },
            timeout: 25000, // 25 second timeout (Render friendly)
            maxRedirects: 5
        });

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from Groq API');
        }

        const answer = response.data.choices[0].message.content.trim();
        
        if (!answer || answer.length === 0) {
            throw new Error('Empty response from Groq API');
        }

        console.log('Answer generated successfully');
        return answer;

    } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            throw new Error('Invalid Groq API key');
        } else if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 400) {
            throw new Error('Invalid request to Groq API');
        } else if (error.response?.status >= 500) {
            throw new Error('Groq API service error');
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to Groq API');
        } else {
            throw new Error(`Answer generation failed: ${error.message}`);
        }
    }
}