import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

async function extractTextFromFile(file) {
  const buffer = file.buffer;
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    try {
      const pdfData = new Uint8Array(buffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + " ";
      }

      return fullText.replace(/\s{2,}/g, ' ').trim();
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.replace(/\s{2,}/g, ' ').trim();
  }

  throw new Error(`Unsupported file format: .${ext}`);
}

export { extractTextFromFile };
