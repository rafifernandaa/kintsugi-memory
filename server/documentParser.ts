import zlib from "zlib";

export interface ParsedDocumentResult {
  filename: string;
  mimeType: string;
  extractedText: string;
  isGeminiNativeSupported: boolean;
  metadata?: Record<string, any>;
}

/**
 * Lightweight, zero-dependency pure-Node ZIP unzipper for DOCX / PPTX archives.
 */
function extractZipEntries(buffer: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();
  let offset = 0;

  while (offset < buffer.length - 30) {
    // Check for Local File Header Signature: 0x04034b50 (PK\x03\x04)
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const uncompressedSize = buffer.readUInt32LE(offset + 22);
      const fileNameLength = buffer.readUInt16LE(offset + 26);
      const extraFieldLength = buffer.readUInt16LE(offset + 28);

      const headerSize = 30 + fileNameLength + extraFieldLength;
      const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLength);
      const dataStart = offset + headerSize;
      const dataEnd = dataStart + compressedSize;

      if (dataEnd <= buffer.length && compressedSize > 0) {
        const compressedData = buffer.subarray(dataStart, dataEnd);
        try {
          let decompressed: Buffer;
          if (compressionMethod === 8) {
            decompressed = zlib.inflateRawSync(compressedData);
          } else if (compressionMethod === 0) {
            decompressed = compressedData;
          } else {
            decompressed = Buffer.alloc(0);
          }
          if (decompressed.length > 0) {
            entries.set(fileName, decompressed);
          }
        } catch {
          // Continue if single entry fails to decompress
        }
      }

      offset = dataEnd;
    } else {
      offset++;
    }
  }

  return entries;
}

/**
 * Extracts plain text from Word (.docx) document XML.
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    const entries = extractZipEntries(buffer);
    const docXmlBuffer = entries.get("word/document.xml");
    if (!docXmlBuffer) {
      // Fallback: search any xml containing w:t
      for (const [name, buf] of entries.entries()) {
        if (name.includes("document") && name.endsWith(".xml")) {
          return parseDocxXml(buf.toString("utf8"));
        }
      }
      return "";
    }
    return parseDocxXml(docXmlBuffer.toString("utf8"));
  } catch (err: any) {
    console.warn("Error extracting text from docx:", err?.message || err);
    return "";
  }
}

function parseDocxXml(xml: string): string {
  // Replace paragraph endings with newlines
  const withParagraphs = xml.replace(/<\/w:p>/gi, "\n");
  // Extract text from <w:t> tags
  const textMatches = withParagraphs.match(/<w:t[^>]*>(.*?)<\/w:t>/gi) || [];
  const text = textMatches
    .map((tag) => tag.replace(/<[^>]+>/g, ""))
    .join("")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  // Clean up excessive whitespace while preserving paragraphs
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Extracts plain text from PowerPoint (.pptx) presentation XML.
 */
export function extractTextFromPptx(buffer: Buffer): string {
  try {
    const entries = extractZipEntries(buffer);
    const slideEntries: { slideNum: number; text: string }[] = [];

    for (const [name, buf] of entries.entries()) {
      const match = name.match(/ppt\/slides\/slide(\d+)\.xml/i);
      if (match) {
        const slideNum = parseInt(match[1], 10);
        const xml = buf.toString("utf8");
        const withParagraphs = xml.replace(/<\/a:p>/gi, "\n");
        const textMatches = withParagraphs.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
        const slideText = textMatches
          .map((tag) => tag.replace(/<[^>]+>/g, ""))
          .join(" ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();

        if (slideText) {
          slideEntries.push({ slideNum, text: slideText });
        }
      }
    }

    slideEntries.sort((a, b) => a.slideNum - b.slideNum);
    return slideEntries
      .map((s) => `[Slide ${s.slideNum}]\n${s.text}`)
      .join("\n\n---\n\n");
  } catch (err: any) {
    console.warn("Error extracting text from pptx:", err?.message || err);
    return "";
  }
}

/**
 * Universal document and file text extractor.
 */
export function parseUploadedDocument(
  fileBuffer: Buffer,
  filename: string,
  declaredMimeType?: string
): ParsedDocumentResult {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  let mimeType = declaredMimeType || "application/octet-stream";
  let extractedText = "";
  let isGeminiNativeSupported = false;

  if (ext === "pdf" || mimeType.includes("pdf")) {
    mimeType = "application/pdf";
    isGeminiNativeSupported = true; // Gemini natively processes PDF documents
    // Extract textual content from document streams if available
    const rawStr = fileBuffer.toString("latin1");
    const streamMatches = rawStr.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g) || [];
    const textPieces: string[] = [];
    for (const match of streamMatches) {
      const inside = match.replace(/^stream[\r\n]+/, "").replace(/[\r\n]+endstream$/, "");
      try {
        const decompressed = zlib.inflateSync(Buffer.from(inside, "latin1")).toString("utf8");
        const btEtMatches = decompressed.match(/BT[\s\S]*?ET/g) || [];
        for (const b of btEtMatches) {
          const tjMatches = b.match(/\((.*?)\)\s*Tj/g) || [];
          for (const tj of tjMatches) {
            textPieces.push(tj.replace(/^\(/, "").replace(/\)\s*Tj$/, ""));
          }
        }
      } catch {
        // Stream may not be flate compressed or pure text
      }
    }
    extractedText = textPieces.join(" ").slice(0, 10000);
  } else if (ext === "docx" || mimeType.includes("wordprocessingml") || mimeType.includes("msword")) {
    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    extractedText = extractTextFromDocx(fileBuffer);
  } else if (ext === "pptx" || mimeType.includes("presentationml") || mimeType.includes("powerpoint")) {
    mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    extractedText = extractTextFromPptx(fileBuffer);
  } else if (["txt", "md", "markdown", "csv", "tsv", "json", "rtf", "log"].includes(ext) || mimeType.startsWith("text/")) {
    mimeType = ext === "md" ? "text/markdown" : ext === "csv" ? "text/csv" : "text/plain";
    extractedText = fileBuffer.toString("utf8");
  } else if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) || mimeType.startsWith("image/")) {
    mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    isGeminiNativeSupported = true;
  } else if (["mp3", "wav", "webm", "ogg", "m4a", "aac"].includes(ext) || mimeType.startsWith("audio/")) {
    mimeType = ext === "mp3" ? "audio/mp3" : ext === "wav" ? "audio/wav" : ext === "ogg" ? "audio/ogg" : "audio/webm";
    isGeminiNativeSupported = true;
  }

  return {
    filename,
    mimeType,
    extractedText,
    isGeminiNativeSupported,
    metadata: {
      fileSize: fileBuffer.length,
      fileExtension: ext,
    },
  };
}
