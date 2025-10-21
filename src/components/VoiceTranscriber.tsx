import React, { useState, useEffect, useRef } from "react";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

const VoiceTranscriber = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [status, setStatus] = useState("Stopped");
  const [isSupported, setIsSupported] = useState(true);
  const [techMode, setTechMode] = useState(true); // Enable technical corrections by default
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const lastProcessedResultIndexRef = useRef<number>(-1);

  // Enhanced coding and web development terminology corrections
  const correctTechnicalTerms = (text: string): string => {
    if (!techMode) return text;

    const corrections: { [key: string]: string } = {
      // Web Development Frameworks & Libraries
      'react': 'React',
      'next js': 'Next.js',
      'nextjs': 'Next.js',
      'view js': 'Vue.js',
      'vuejs': 'Vue.js',
      'angular': 'Angular',
      'svelte': 'Svelte',
      'tailwind': 'Tailwind CSS',
      'tailwind css': 'Tailwind CSS',
      'bootstrap': 'Bootstrap',
      'material ui': 'Material-UI',
      'chakra ui': 'Chakra UI',
      
      // Programming Languages
      'javascript': 'JavaScript',
      'java script': 'JavaScript',
      'typescript': 'TypeScript',
      'type script': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'c plus plus': 'C++',
      'c sharp': 'C#',
      'php': 'PHP',
      'go lang': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      
      // Web Technologies
      'html': 'HTML',
      'html5': 'HTML5',
      'css': 'CSS',
      'css3': 'CSS3',
      'sass': 'SASS',
      'scss': 'SCSS',
      'less': 'LESS',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      
      // Development Tools
      'vs code': 'VS Code',
      'visual studio code': 'VS Code',
      'git': 'Git',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'bitbucket': 'Bitbucket',
      'npm': 'npm',
      'yarn': 'Yarn',
      'webpack': 'Webpack',
      'vite': 'Vite',
      'babel': 'Babel',
      'eslint': 'ESLint',
      'prettier': 'Prettier',
      
      // Database & Backend
      'mongodb': 'MongoDB',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'redis': 'Redis',
      'firebase': 'Firebase',
      'supabase': 'Supabase',
      'node js': 'Node.js',
      'nodejs': 'Node.js',
      'express': 'Express.js',
      'fastify': 'Fastify',
      'nest js': 'NestJS',
      'nestjs': 'NestJS',
      
      // Cloud & DevOps
      'aws': 'AWS',
      'amazon web services': 'AWS',
      'azure': 'Azure',
      'google cloud': 'Google Cloud',
      'gcp': 'GCP',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'netlify': 'Netlify',
      'vercel': 'Vercel',
      'heroku': 'Heroku',
      
      // Programming Concepts
      'api': 'API',
      'rest api': 'REST API',
      'restful': 'RESTful',
      'graphql': 'GraphQL',
      'graph ql': 'GraphQL',
      'websocket': 'WebSocket',
      'web socket': 'WebSocket',
      'ajax': 'AJAX',
      'fetch': 'fetch',
      'async': 'async',
      'await': 'await',
      'promise': 'Promise',
      'callback': 'callback',
      'closure': 'closure',
      'hoisting': 'hoisting',
      'prototype': 'prototype',
      
      // React Specific
      'use state': 'useState',
      'use effect': 'useEffect',
      'use context': 'useContext',
      'use reducer': 'useReducer',
      'use memo': 'useMemo',
      'use callback': 'useCallback',
      'use ref': 'useRef',
      'jsx': 'JSX',
      'tsx': 'TSX',
      'props': 'props',
      'state': 'state',
      'component': 'component',
      'hook': 'hook',
      'hooks': 'hooks',
      
      // Code Structure
      'function': 'function',
      'arrow function': 'arrow function',
      'const': 'const',
      'let': 'let',
      'var': 'var',
      'class': 'class',
      'interface': 'interface',
      'type': 'type',
      'enum': 'enum',
      'import': 'import',
      'export': 'export',
      'default export': 'default export',
      'named export': 'named export',
      
      // Data Types & Structures
      'array': 'array',
      'object': 'object',
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'null': 'null',
      'undefined': 'undefined',
      'map': 'Map',
      'set': 'Set',
      'weak map': 'WeakMap',
      'weak set': 'WeakSet',
      
      // Control Flow
      'if statement': 'if statement',
      'else if': 'else if',
      'switch case': 'switch case',
      'for loop': 'for loop',
      'while loop': 'while loop',
      'do while': 'do while',
      'for each': 'forEach',
      'for of': 'for...of',
      'for in': 'for...in',
      
      // Web APIs
      'dom': 'DOM',
      'document object model': 'DOM',
      'event listener': 'event listener',
      'local storage': 'localStorage',
      'session storage': 'sessionStorage',
      'cookies': 'cookies',
      'web storage': 'Web Storage',
      'geolocation': 'Geolocation',
      'notification': 'Notification',
      
      // CSS & Styling
      'flexbox': 'Flexbox',
      'css grid': 'CSS Grid',
      'grid': 'Grid',
      'media query': 'media query',
      'responsive design': 'responsive design',
      'mobile first': 'mobile-first',
      'css variables': 'CSS variables',
      'custom properties': 'CSS custom properties',
      
      // Testing
      'jest': 'Jest',
      'cypress': 'Cypress',
      'testing library': 'Testing Library',
      'unit test': 'unit test',
      'integration test': 'integration test',
      'end to end': 'end-to-end',
      'e2e': 'E2E',
      
      // Performance
      'lazy loading': 'lazy loading',
      'code splitting': 'code splitting',
      'tree shaking': 'tree shaking',
      'bundle size': 'bundle size',
      'lighthouse': 'Lighthouse',
      'web vitals': 'Web Vitals',
      'seo': 'SEO',
      'search engine optimization': 'SEO',
      
      // Common Abbreviations
      'url': 'URL',
      'uri': 'URI',
      'http': 'HTTP',
      'https': 'HTTPS',
      'ssl': 'SSL',
      'tls': 'TLS',
      'cdn': 'CDN',
      'cors': 'CORS',
      'csrf': 'CSRF',
      'jwt': 'JWT',
      'oauth': 'OAuth',
      
      // File Extensions & Formats
      'dot js': '.js',
      'dot ts': '.ts',
      'dot jsx': '.jsx',
      'dot tsx': '.tsx',
      'dot css': '.css',
      'dot scss': '.scss',
      'dot json': '.json',
      'dot md': '.md',
      'dot html': '.html',
      'dot env': '.env'
    };

    let correctedText = text;
    
    // Apply corrections with word boundaries to avoid partial matches
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correct);
    });
    
    return correctedText;
  };

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatus("Speech Recognition not supported in this browser");
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = true; // Enable interim results for better UX
    recognition.lang = language;
    recognition.maxAlternatives = 1; // Get the best result

    recognition.onstart = () => {
      console.log('🎙️ Speech recognition started successfully');
      setStatus("Listening...");
      setListening(true);
      isProcessingRef.current = false;
      lastSpeechTimeRef.current = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      // Process only new results to avoid duplication
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript.trim();
        
        if (result.isFinal && transcriptPart) {
          // Only add NEW final results we haven't seen before
          if (i > lastProcessedResultIndexRef.current) {
            const correctedTranscript = correctTechnicalTerms(transcriptPart);
            finalTranscript += correctedTranscript + " ";
            lastProcessedResultIndexRef.current = i;
          }
        } else if (!result.isFinal && transcriptPart) {
          const correctedTranscript = correctTechnicalTerms(transcriptPart);
          interimTranscript += correctedTranscript;
        }
      }
      
      // Update last speech time when we get any speech
      if (finalTranscript || interimTranscript) {
        lastSpeechTimeRef.current = Date.now();
        
        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        // Set up new silence timer (1 second)
        silenceTimerRef.current = setTimeout(() => {
          if (listening && !isProcessingRef.current) {
            stopListening();
          }
        }, 1000);
      }
      
      // Update transcript with final results
      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev ? prev + finalTranscript : finalTranscript;
          return newTranscript.trim();
        });
        setStatus("Transcribing...");
      }
      
      // Show interim results in status
      if (interimTranscript && !finalTranscript) {
        setStatus(`Listening... "${interimTranscript}"`);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error, event);
      console.log('Error details:', {
        error: event.error,
        message: event.message,
        type: event.type,
        timeStamp: event.timeStamp
      });
      
      let errorMessage = `Error: ${event.error}`;
      
      // Provide more helpful error messages
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Please use HTTPS.';
          break;
        case 'bad-grammar':
          errorMessage = 'Grammar error in speech recognition.';
          break;
        case 'language-not-supported':
          errorMessage = 'Selected language not supported.';
          break;
      }
      
      setStatus(errorMessage);
      setListening(false);
      isProcessingRef.current = false;
      
      // Clear silence timer on error
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onend = () => {
      setListening(false);
      isProcessingRef.current = false;
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      if (transcript) {
        setStatus("Transcription complete");
      } else {
        setStatus("Stopped");
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language]);

  const checkMicrophonePermission = async () => {
    try {
      console.log('🔍 Checking microphone permission...');
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('🎤 Microphone permission state:', result.state);
      return result.state;
    } catch (error) {
      console.log('⚠️ Could not check microphone permission:', error);
      return 'unknown';
    }
  };

  const startListening = async () => {
    console.log('🎤 Starting speech recognition...');
    console.log('Protocol:', location.protocol);
    console.log('Hostname:', location.hostname);
    console.log('User Agent:', navigator.userAgent);
    
    if (!isSupported) {
      const message = "Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.";
      console.error('❌', message);
      alert(message);
      return;
    }

    // Check for HTTPS or localhost (required for microphone access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      const message = 'Microphone access requires HTTPS or localhost. Please use a secure connection.';
      console.error('❌', message);
      alert(message);
      return;
    }

    // Check microphone permission
    const micPermission = await checkMicrophonePermission();
    if (micPermission === 'denied') {
      const message = 'Microphone access is denied. Please enable microphone access in your browser settings and refresh the page.';
      console.error('❌', message);
      alert(message);
      return;
    }

    if (recognitionRef.current && !listening) {
      // Clear previous transcript and reset state
      setTranscript("");
      isProcessingRef.current = false;
      lastProcessedResultIndexRef.current = -1; // Reset result tracking
      
      // Clear any existing timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Update language
      recognitionRef.current.lang = language;
      
      try {
        console.log('🚀 Attempting to start recognition...');
        recognitionRef.current.start();
        setStatus("Starting...");
        console.log('✅ Recognition start command sent');
      } catch (error) {
        console.error("❌ Error starting recognition:", error);
        setStatus(`Error starting recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        alert(`Failed to start speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      isProcessingRef.current = true;
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      try {
        recognitionRef.current.stop();
        setStatus("Processing...");
      } catch (error) {
        console.error("Error stopping recognition:", error);
        setListening(false);
        setStatus("Stopped");
      }
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setStatus("Stopped");
    
    // Clear any existing timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Reset processing state
    isProcessingRef.current = false;
    lastProcessedResultIndexRef.current = -1; // Reset result tracking
  };

  const copyToClipboard = async () => {
    if (transcript) {
      try {
        await navigator.clipboard.writeText(transcript);
        setStatus("Copied to clipboard!");
        setTimeout(() => setStatus("Stopped"), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
        setStatus("Failed to copy");
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h1 className="text-2xl font-semibold text-red-700">🎙️ Voice Transcriber</h1>
        <p className="text-red-600 text-center">
          Speech Recognition is not supported in this browser.
          <br />
          Please use Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">🎙️ Free Voice Transcriber</h1>
      
      <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={listening}
          >
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="ne-NP">🇳🇵 Nepali</option>
            <option value="hi-IN">🇮🇳 Hindi</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={startListening}
            disabled={listening}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-lg">🎤</span>
            Start Recording
          </button>
          
          <button
            onClick={stopListening}
            disabled={!listening}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-lg">⏹️</span>
            Stop Recording
          </button>
          
          <button
            onClick={clearTranscript}
            disabled={listening}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-lg">🗑️</span>
            Clear
          </button>
        </div>

        {/* Status Display */}
        <div className="mb-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            listening 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : status.includes('Error')
              ? 'bg-red-100 text-red-800 border border-red-200'
              : status.includes('complete') || status.includes('Copied')
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {listening && <span className="animate-pulse">🔴</span>}
            {status}
          </div>
        </div>

        {/* Transcript Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transcription Results
          </label>
          <div className={`w-full border-2 rounded-lg p-4 min-h-[120px] transition-all duration-200 ${
            listening 
              ? 'border-green-300 bg-green-50' 
              : transcript 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-300 bg-gray-50'
          }`}>
            {transcript ? (
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </div>
            ) : (
              <div className="text-gray-500 text-center flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-2">🎤</div>
                <div className="text-lg font-medium">Ready to transcribe</div>
                <div className="text-sm mt-1">
                  {listening 
                    ? "Listening for your voice... Speak now!" 
                    : "Click 'Start Recording' and speak clearly"
                  }
                </div>
                <div className="text-xs mt-2 text-gray-400">
                  ⏱️ Auto-stops after 1 second of silence
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copy Button */}
        {transcript && (
          <div className="flex justify-end">
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-sm">📋</span>
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 max-w-lg">
        <p className="mb-2">
          <strong>Instructions:</strong> Select your language, click "Start Recording", speak clearly, then click "Stop Recording".
        </p>
        <p>
          <strong>Note:</strong> This uses your browser's built-in speech recognition. Works best in Chrome, Edge, and Safari.
          Requires HTTPS or localhost for microphone access.
        </p>
      </div>
    </div>
  );
};

export default VoiceTranscriber;
