import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
}

export class GeminiSpeechToText {
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required. Please add your Gemini API key to the .env file.');
    }

    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
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

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: audioBlob.type,
            data: base64Audio
          }
        },
        prompt
      ]);

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
        } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }
      }
      
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enhanceText(text: string): Promise<string> {
    try {
      if (!text.trim()) {
        throw new Error('No text provided to enhance');
      }

      const prompt = `Transform the following brief text into a detailed, comprehensive, and well-structured version. Expand the content with relevant details, context, and specifics while maintaining the core message. Make it thorough and complete without adding explanations, justifications, or meta-commentary.

Original text: "${text}"

Detailed version:`;

      console.log('Sending text enhancement request to Gemini API');

      const result = await this.model.generateContent(prompt);
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
        } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }
      }
      
      throw new Error(`Text enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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