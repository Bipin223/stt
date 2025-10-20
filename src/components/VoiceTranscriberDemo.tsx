import React, { useState } from 'react';
import VoiceTranscriber from './VoiceTranscriber';
import Recorder from './Recorder';

const VoiceTranscriberDemo = () => {
  const [activeComponent, setActiveComponent] = useState<'simple' | 'advanced'>('simple');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Speech to Text Components
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Choose between a simple transcriber or the advanced recorder with waveform visualization
          </p>
          
          {/* Component Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveComponent('simple')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeComponent === 'simple'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🎙️ Simple Transcriber
            </button>
            <button
              onClick={() => setActiveComponent('advanced')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeComponent === 'advanced'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🌊 Advanced Recorder
            </button>
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {activeComponent === 'simple' ? (
            <div className="p-6">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Simple Voice Transcriber
                </h2>
                <p className="text-gray-600">
                  Clean, minimal interface for basic speech-to-text functionality
                </p>
              </div>
              <VoiceTranscriber />
            </div>
          ) : (
            <div>
              <div className="p-6 text-center border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Advanced Recorder
                </h2>
                <p className="text-gray-600">
                  Full-featured recorder with waveform visualization and coding terminology corrections
                </p>
              </div>
              <Recorder />
            </div>
          )}
        </div>

        {/* Feature Comparison */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">
              🎙️ Simple Transcriber Features
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Clean, minimal Tailwind UI
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Start/Stop recording buttons
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Language selection (EN/NE/HI)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Status indicators
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Copy to clipboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Browser compatibility checks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                No external dependencies
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-purple-600 mb-4">
              🌊 Advanced Recorder Features
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Real-time waveform visualization
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Pause/Resume functionality
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Coding terminology corrections
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Auto-transcription on silence
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Interim results display
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Advanced audio processing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Particle effects and animations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranscriberDemo;
