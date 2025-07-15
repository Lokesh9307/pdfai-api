import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function processPDFBuffer(pdfBuffer) {
    const uint8Array = new Uint8Array(pdfBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        extractedText += pageText + '\n';
    }

    return extractedText.trim();
}
