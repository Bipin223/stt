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

  async transcribeAudio(audioBlob: Blob, language: string = 'en'): Promise<TranscriptionResult> {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Create the prompt based on language
      const languagePrompts = {
        'en-US': 'Transcribe this English audio to text. Focus on accuracy and proper formatting. If you detect coding or technical terms, ensure they are correctly formatted.',
        'ne-NP': 'यो नेपाली अडियोलाई पाठमा रूपान्तरण गर्नुहोस्। सटीकता र उचित ढाँचामा ध्यान दिनुहोस्।',
        'hi-IN': 'इस हिंदी ऑडियो को टेक्स्ट में ट्रांसक्राइब करें। सटीकता और उचित फॉर्मेटिंग पर ध्यान दें।'
      };

      const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts['en-US'];

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

      // Apply coding term corrections for English
      const correctedText = language === 'en-US' ? this.correctCodingTerms(text) : text;

      return {
        text: correctedText.trim(),
        confidence: 0.9, // Gemini doesn't provide confidence, so we use a default high value
        language: language
      };

    } catch (error) {
      console.error('Gemini transcription error:', error);
      
      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid API key. Please check your Gemini API key in the .env file.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
        } else if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please ensure your API key has the necessary permissions.');
        }
      }
      
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private correctCodingTerms(text: string): string {
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