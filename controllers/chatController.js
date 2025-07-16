import { processPDFBuffer } from '../utils/pdfProcessor.js';
import { storePDFTextAsVectors, retrieveRelevantChunks } from '../utils/vectorStore.js';
import { generateAnswer } from '../llm/groqDeepSeek.js';

export async function handleChatWithPDF(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                error: 'No PDF file uploaded. Ensure the file is sent with the field name "pdf".'
            });
        }

        const pdfBuffer = req.file.buffer;
        const question = req.body.question;

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid question. Provide a valid question in the request body.'
            });
        }

        const pdfText = await processPDFBuffer(pdfBuffer);

        if (!pdfText || pdfText.trim().length === 0) {
            return res.status(400).json({
                error: 'Failed to extract text from PDF. Ensure the PDF is not empty.'
            });
        }

        const chunks = splitTextIntoChunks(pdfText);

        await storePDFTextAsVectors(chunks);

        const relevantChunks = await retrieveRelevantChunks(question);

        if (!relevantChunks || relevantChunks.length === 0) {
            return res.status(404).json({
                error: 'No relevant information found in the PDF to answer the question.'
            });
        }

        const answer = await generateAnswer(question, relevantChunks);

        res.json({ answer });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

function splitTextIntoChunks(text, maxChunkLength = 1000) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + maxChunkLength, text.length);
        chunks.push(text.slice(start, end));
        start = end;
    }

    return chunks;
}
