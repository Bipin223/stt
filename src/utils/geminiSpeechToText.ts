import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
}

// Request throttler to prevent rate limit errors
class RequestThrottler {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private lastRequestTime: number = 0;
  private readonly minDelayMs: number = 5000; // 5 seconds between requests (safer than 4s minimum for 15 req/min)
  private readonly maxRetries: number = 3;

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Retry logic with exponential backoff
          const result = await this.retryWithBackoff(request);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async retryWithBackoff<T>(request: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await request();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error (429)
        const is429Error = error?.message?.includes('429') ||
          error?.message?.includes('Resource exhausted') ||
          error?.message?.includes('RESOURCE_EXHAUSTED');

        if (is429Error && attempt < this.maxRetries - 1) {
          // Exponential backoff: 15s, 30s, 60s (longer delays for rate limits)
          const waitTime = attempt === 0 ? 15000 : attempt === 1 ? 30000 : 60000;
          console.log(`⚠️ Rate limit hit (429). Waiting ${waitTime / 1000}s before retry... (Attempt ${attempt + 1}/${this.maxRetries})`);
          console.log(`💡 Tip: Free tier = 15 requests/minute. Wait at least 5 seconds between operations.`);
          await this.delay(waitTime);
        } else if (!is429Error) {
          // If it's not a rate limit error, don't retry
          throw error;
        }
      }
    }

    // All retries failed
    throw lastError;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Wait if we need to throttle
      if (timeSinceLastRequest < this.minDelayMs) {
        const waitTime = this.minDelayMs - timeSinceLastRequest;
        console.log(`⏳ Throttling: waiting ${(waitTime / 1000).toFixed(1)}s before next API request...`);
        await this.delay(waitTime);
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global throttler instance
const throttler = new RequestThrottler();

export class GeminiSpeechToText {
  private model: any;
  private isProcessing: boolean = false;
  private isEnhancing: boolean = false;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required. Please add your Gemini API key to the .env file.');
    }

    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    // Prevent multiple simultaneous transcriptions
    if (this.isProcessing) {
      console.warn('⚠️ Transcription already in progress. Ignoring duplicate request.');
      throw new Error('A transcription is already in progress. Please wait for it to complete.');
    }

    this.isProcessing = true;

    try {
      // Check file size limit (20MB = 20 * 1024 * 1024 bytes)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (audioBlob.size > maxSize) {
        throw new Error(`Audio file too large (${(audioBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 20MB.`);
      }

      console.log(`Processing audio file: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB, type: ${audioBlob.type}`);

      // Convert blob to base64 using FileReader (more reliable than manual conversion)
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read audio file'));
        reader.readAsDataURL(audioBlob);
      });

      // Enhanced prompt for better transcription accuracy
      const prompt = `Transcribe this audio file to text. Requirements:
- Transcribe in English language only
- Provide accurate word-for-word transcription
- Use proper punctuation and capitalization
- Handle technical terms correctly
- Return only the transcribed text, no additional commentary

Audio format: ${audioBlob.type}`;

      console.log(`Sending request to Gemini API with ${base64Audio.length} characters of base64 data`);

      // Use throttler to prevent rate limit errors
      const result = await throttler.enqueue(async () => {
        return await this.model.generateContent([
          {
            inlineData: {
              mimeType: audioBlob.type,
              data: base64Audio
            }
          },
          prompt
        ]);
      });

      const response = await result.response;
      const text = response.text();

      console.log('Gemini API response received:', text.substring(0, 100) + '...');

      // Apply general term corrections
      const correctedText = this.correctCommonTerms(text);

      return {
        text: correctedText.trim(),
        confidence: 0.9, // Gemini doesn't provide confidence, so we use a default high value
        language: 'en-US'
      };

    } catch (error) {
      console.error('Gemini transcription error:', error);

      // Handle specific API errors
      if (error instanceof Error) {
        // File size error
        if (error.message.includes('Audio file too large')) {
          throw error;
        }
        // Base64 conversion errors
        if (error.message.includes('Failed to read audio file')) {
          throw new Error('Failed to process audio file. Please try recording again.');
        }
        // API errors
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key in the .env file.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
        } else if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please ensure your API key has the necessary permissions.');
        } else if (error.message.includes('Invalid value') || error.message.includes('Base64 decoding failed')) {
          throw new Error('Audio format not supported or corrupted. Please try recording again.');
        } else if (error.message.includes('Request payload size exceeds')) {
          throw new Error('Audio file too large. Please try a shorter recording (max 20MB).');
        } else if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
          throw new Error('⏱️ Rate limit reached! Please wait 10-15 seconds before trying again. (Free tier: 15 requests/minute)');
        }
      }

      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always release the lock
      this.isProcessing = false;
    }
  }

  async enhanceText(text: string): Promise<string> {
    // Prevent multiple simultaneous enhancements
    if (this.isEnhancing) {
      console.warn('⚠️ Text enhancement already in progress. Ignoring duplicate request.');
      throw new Error('A text enhancement is already in progress. Please wait for it to complete.');
    }

    this.isEnhancing = true;

    try {
      if (!text.trim()) {
        throw new Error('No text provided to enhance');
      }

      const prompt = `Take the following user input and refine it into a clear, well-structured prompt. Keep it concise and focused on the main idea.

      Rules:
      - Preserve the core intent and keep it brief
      - Fix grammar, remove filler words, and improve clarity
      - Add only essential context or details that strengthen the request
      - Use a clean, professional structure
      - Output should be 2-4 sentences maximum unless the input is already detailed
      - Do NOT over-expand or add unnecessary sections

      User input: "${text}"

      Refined prompt:`;

      console.log('Sending text enhancement request to Gemini API');

      // Use throttler to prevent rate limit errors
      const result = await throttler.enqueue(async () => {
        return await this.model.generateContent(prompt);
      });
      const response = await result.response;
      const enhancedText = response.text();

      console.log('Text enhancement completed');

      return enhancedText.trim();

    } catch (error) {
      console.error('Text enhancement error:', error);

      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key in the .env file.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
        } else if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please ensure your API key has the necessary permissions.');
        } else if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
          throw new Error('⏱️ Rate limit reached! Please wait 10-15 seconds before trying again. (Free tier: 15 requests/minute)');
        }
      }

      throw new Error(`Text enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always release the lock
      this.isEnhancing = false;
    }
  }

  private correctCommonTerms(text: string): string {
    const corrections: { [key: string]: string } = {
      'evaluation': 'navigation',
      'function': 'function',
      'variable': 'variable',
      'array': 'array',
      'object': 'object',
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'if statement': 'if statement',
      'for loop': 'for loop',
      'while loop': 'while loop',
      'class': 'class',
      'method': 'method',
      'property': 'property',
      'component': 'component',
      'react': 'React',
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'api': 'API',
      'json': 'JSON',
      'database': 'database',
      'server': 'server',
      'client': 'client',
      'frontend': 'frontend',
      'backend': 'backend',
      'framework': 'framework',
      'library': 'library',
      'import': 'import',
      'export': 'export',
      'const': 'const',
      'let': 'let',
      'var': 'var',
      'async': 'async',
      'await': 'await',
      'promise': 'Promise',
      'callback': 'callback',
      'event': 'event',
      'handler': 'handler',
      'state': 'state',
      'props': 'props',
      'hook': 'hook',
      'use effect': 'useEffect',
      'use state': 'useState'
    };

    let correctedText = text;
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correct);
    });

    return correctedText;
  }
}

export const geminiSpeechToText = new GeminiSpeechToText();