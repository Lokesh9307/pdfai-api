import { processPDFBuffer } from '../utils/pdfProcessor.js';
import { storePDFTextAsVectors } from '../utils/vectorStore.js';

export async function handleChatWithPDF(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded. Ensure the file is sent with field name "pdf".' });
        }

        const pdfBuffer = req.file.buffer; 
        const question = req.body.question || '';

        const pdfText = await processPDFBuffer(pdfBuffer);
        await storePDFTextAsVectors(pdfText);

        const relevantChunks = await retrieveRelevantChunks(question);
        const answer = await generateAnswer(question, relevantChunks);

        res.json({ answer });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
