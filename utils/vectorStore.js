import axios from 'axios';

const VECTOR_SERVICE_URL = process.env.VECTOR_SERVICE_PORT_HOST_URL;

// Validate environment variable with better error handling
if (!VECTOR_SERVICE_URL) {
    console.error('⚠️  VECTOR_SERVICE_URL environment variable is not set');
    console.error('   Please set either VECTOR_SERVICE_PORT_HOST_URL or VECTOR_SERVICE_URL');
} else {
    console.log(`✅ Vector service configured: ${VECTOR_SERVICE_URL}`);
}

export async function storePDFTextAsVectors(text) {
    if (!VECTOR_SERVICE_URL) {
        throw new Error('Vector service URL is not configured');
    }

    if (!text || text.length === 0) {
        throw new Error('No text provided for vector storage');
    }

    const chunkSize = 500;
    const chunks = [];

    // Create chunks with overlap for better context
    const overlap = 50;
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize);
        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }
    }

    console.log(`Created ${chunks.length} chunks for vector storage`);

    try {
        const response = await axios.post(`${VECTOR_SERVICE_URL}/add_chunks`, { chunks }, {
            timeout: 25000, // 25 second timeout (Render friendly)
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'PDF-AI-Server/1.0'
            },
            maxRedirects: 5
        });
        
        console.log('Chunks stored successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Vector storage error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Vector service is not available');
        } else if (error.response?.status === 404) {
            throw new Error('Vector service endpoint not found');
        } else if (error.response?.status >= 500) {
            throw new Error('Vector service internal error');
        } else {
            throw new Error(`Vector storage failed: ${error.message}`);
        }
    }
}

export async function retrieveRelevantChunks(query) {
    if (!VECTOR_SERVICE_URL) {
        throw new Error('Vector service URL is not configured');
    }

    if (!query || query.trim().length === 0) {
        throw new Error('No query provided for chunk retrieval');
    }

    try {
        const response = await axios.post(`${VECTOR_SERVICE_URL}/search`, {
            query: query.trim(),
            top_k: 3
        }, {
            timeout: 25000, // 25 second timeout (Render friendly)
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'PDF-AI-Server/1.0'
            },
            maxRedirects: 5
        });

        if (!response.data || !response.data.results) {
            throw new Error('Invalid response from vector service');
        }

        console.log(`Retrieved ${response.data.results.length} relevant chunks`);
        return response.data.results.join('\n');
    } catch (error) {
        console.error('Chunk retrieval error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Vector service is not available');
        } else if (error.response?.status === 404) {
            throw new Error('Vector service endpoint not found');
        } else if (error.response?.status >= 500) {
            throw new Error('Vector service internal error');
        } else {
            throw new Error(`Chunk retrieval failed: ${error.message}`);
        }
    }
}