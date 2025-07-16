import axios from 'axios';

const VECTOR_SERVICE_URL = process.env.VECTOR_SERVICE_PORT_HOST_URL;

export async function storePDFTextAsVectors(text) {
    const chunkSize = 500;
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    await axios.post(`${VECTOR_SERVICE_PORT_HOST_URL}/add_chunks`, { chunks });
}

export async function retrieveRelevantChunks(query) {
    const response = await axios.post(`${VECTOR_SERVICE_URL}/search`, {
        query,
        top_k: 3
    });

    return response.data.results.join('\n');
}
