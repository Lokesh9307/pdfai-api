import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function processPDFBuffer(pdfBuffer) {
    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer is empty or invalid');
    }

    try {
        console.log('Converting PDF buffer to Uint8Array...');
        const uint8Array = new Uint8Array(pdfBuffer);

        console.log('Loading PDF document...');
        const loadingTask = pdfjsLib.getDocument({ 
            data: uint8Array,
            verbosity: 0 // Reduce PDF.js logging
        });
        
        const pdfDocument = await loadingTask.promise;
        console.log(`PDF loaded successfully. Pages: ${pdfDocument.numPages}`);

        let extractedText = '';
        const maxPages = Math.min(pdfDocument.numPages, 50); // Reduced for Render performance

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
                console.log(`Processing page ${pageNum}/${maxPages}`);
                const page = await pdfDocument.getPage(pageNum);
                const content = await page.getTextContent();
                
                if (content && content.items && content.items.length > 0) {
                    const pageText = content.items
                        .map(item => item.str || '')
                        .filter(str => str.trim().length > 0)
                        .join(' ');
                    
                    if (pageText.trim()) {
                        extractedText += pageText + '\n';
                    }
                }
            } catch (pageError) {
                console.error(`Error processing page ${pageNum}:`, pageError);
                // Continue with other pages
            }
        }

        if (pdfDocument.numPages > maxPages) {
            console.log(`Note: Only processed first ${maxPages} pages of ${pdfDocument.numPages} total pages`);
        }

        const finalText = extractedText.trim();
        
        if (!finalText || finalText.length === 0) {
            throw new Error('No text could be extracted from the PDF');
        }

        console.log(`Successfully extracted ${finalText.length} characters from PDF`);
        return finalText;

    } catch (error) {
        console.error('PDF processing error:', error);
        
        if (error.name === 'InvalidPDFException') {
            throw new Error('Invalid PDF file format');
        } else if (error.name === 'MissingPDFException') {
            throw new Error('PDF file is missing or corrupted');
        } else if (error.name === 'UnexpectedResponseException') {
            throw new Error('PDF file is corrupted or unreadable');
        } else {
            throw new Error(`PDF processing failed: ${error.message}`);
        }
    }
}