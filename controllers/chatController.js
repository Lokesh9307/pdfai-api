import { processPDFBuffer } from '../utils/pdfProcessor.js';
import { generateAnswer } from '../llm/groqDeepSeek.js';
import { storePDFTextAsVectors, retrieveRelevantChunks } from '../utils/vectorStore.js';

export async function handleChatWithPDF(req, res) {
    try {
        const pdfBuffer = req.file.buffer; 
        const question = req.body.question;

        const pdfText = await processPDFBuffer(pdfBuffer);

        await storePDFTextAsVectors(pdfText);

        const relevantChunks = await retrieveRelevantChunks(question);

        const answer = await generateAnswer(question, relevantChunks);

        res.json({ answer });

    } catch (error) {
        console.error('Chat error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
