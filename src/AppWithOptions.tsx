import React, { useState } from 'react'
import Recorder from './components/Recorder'
import VoiceTranscriber from './components/VoiceTranscriber'

export default function AppWithOptions() {
  const [dark, setDark] = useState(false)
  const [activeComponent, setActiveComponent] = useState<'advanced' | 'simple'>('simple')

  return (
    <div className={"app " + (dark ? 'dark' : 'light')}>
      <header className="header">
        <h1>Speech to Text</h1>
        <div className="controls">
          {/* Component Selector */}
          <div className="component-selector" style={{ marginRight: '20px' }}>
            <select 
              value={activeComponent} 
              onChange={(e) => setActiveComponent(e.target.value as 'advanced' | 'simple')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="simple">🎙️ Simple Transcriber</option>
              <option value="advanced">🌊 Advanced Recorder</option>
            </select>
          </div>
          
          <label className="toggle">
            <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
            <span className="slider" />
          </label>
        </div>
      </header>

      <main className="main">
        {activeComponent === 'simple' ? <VoiceTranscriber /> : <Recorder />}
      </main>

      <footer className="footer">
        Built with ♥ By Bipin Rizal — Focused on English, Nepali & Hindi
        <br />
        <small>
          {activeComponent === 'simple' 
            ? '🎙️ Using Simple Voice Transcriber (Tailwind UI)' 
            : '🌊 Using Advanced Recorder (Custom CSS + Waveform)'
          }
        </small>
      </footer>
    </div>
  )
}
