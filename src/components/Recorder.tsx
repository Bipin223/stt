import React, { useEffect, useRef, useState } from 'react'
import { franc } from 'franc'

type Status = 'idle' | 'recording' | 'paused' | 'stopped'

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

const languages = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ne-NP', name: 'Nepali', flag: '🇳🇵' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' }
]

export default function Recorder(): JSX.Element {
  const [status, setStatus] = useState<Status>('idle')
  const [interim, setInterim] = useState<string>('')
  const [lang, setLang] = useState<string>('en-US')
  const [finalText, setFinalText] = useState<string>('')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(0)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastFinalTextRef = useRef<string>('')
  const processedResultsRef = useRef<Set<string>>(new Set())

  // Coding terminology corrections
  const correctCodingTerms = (text: string): string => {
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
    }

    let correctedText = text
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
      correctedText = correctedText.replace(regex, correct)
    })
    
    return correctedText
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang)
    
    // If currently recording, restart with new language
    if (status === 'recording' && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        // Small delay to ensure proper cleanup before restart
        setTimeout(() => {
          start()
        }, 100)
      } catch (e) {
        console.error('Error changing language during recording:', e)
      }
    }
  }

  const start = async () => {
    console.log('Start button clicked!')
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Check if we're on HTTPS or localhost (required for microphone access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      alert('Microphone access requires HTTPS or localhost. Please use a secure connection.')
      return
    }

    // Clear any existing timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Set basic properties safely
    try {
      recognition.lang = lang
      recognition.interimResults = true
      recognition.continuous = true
      recognition.maxAlternatives = 3 // Get more alternatives for better coding term recognition
      
      // Add coding-specific grammar hints if supported
      if ('webkitSpeechRecognition' in window) {
        // These hints help with coding terminology
        recognition.serviceURI = undefined // Let browser choose best service
      }
    } catch (e) {
      console.error('Error setting recognition properties:', e)
    }
    
    // Keep it simple to avoid errors

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const res = e.results[i]
        let transcript = (res[0].transcript || '').trim()
        
        // Apply coding terminology corrections
        transcript = correctCodingTerms(transcript)
        
        if (res.isFinal && transcript) {
          // Create unique identifier for this result
          const resultId = `${i}-${transcript}`
          
          // Only add if we haven't processed this exact result before
          if (!processedResultsRef.current.has(resultId) && transcript !== lastFinalTextRef.current) {
            finalTranscript += transcript
            processedResultsRef.current.add(resultId)
            lastFinalTextRef.current = transcript
          }
        } else if (!res.isFinal && transcript) {
          interimTranscript += transcript
        }
      }
      
      // Update last speech time when we get any speech
      if (interimTranscript || finalTranscript) {
        lastSpeechTimeRef.current = Date.now()
        
        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      }
      
      // Update interim text immediately for responsiveness
      setInterim(interimTranscript)
      
      // Add final transcript only if it's new and not empty
      if (finalTranscript && finalTranscript.trim()) {
        setFinalText(prev => {
          const newText = prev ? prev + ' ' + finalTranscript : finalTranscript
          return newText
        })
      }
      
      // Set up silence detection for auto-transcription
      if (interimTranscript && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          let currentInterim = interimTranscript.trim()
          // Apply coding corrections to interim text too
          currentInterim = correctCodingTerms(currentInterim)
          
          if (currentInterim && currentInterim !== lastFinalTextRef.current) {
            setFinalText(prev => {
              const newText = prev ? prev + ' ' + currentInterim : currentInterim
              lastFinalTextRef.current = currentInterim
              return newText
            })
            setInterim('')
          }
          silenceTimerRef.current = null
        }, 700)
      }
    }

    recognition.onerror = (e: any) => {
      console.error('Recognition error', e)
    }

    recognitionRef.current = recognition

    try {
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      console.log('Microphone access granted!')
      
      mediaStreamRef.current = stream
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if suspended
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
      
      const source = audioCtxRef.current.createMediaStreamSource(stream)
      const analyser = audioCtxRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser

      console.log('Starting waveform and recognition...')
      drawWaveform()
      
      try { 
        recognition.start()
        console.log('Speech recognition started!')
        setStatus('recording')
        console.log('Status set to recording')
      } catch (err) {
        console.error('Recognition start error:', err)
        alert(`Speech recognition failed to start: ${err.message}`)
        return
      }
    } catch (err) {
      console.error('Microphone error:', err)
      alert(`Could not start microphone: ${err.message}`)
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')!
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const timeArray = new Uint8Array(analyser.fftSize)

    let animationTime = 0

    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      animationTime += 0.02
      
      analyser.getByteFrequencyData(dataArray)
      analyser.getByteTimeDomainData(timeArray)
      
      // Clear canvas with dark fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height / 2
      const numBars = 48 // Increased for more vibrant look
      const barWidth = canvas.width / numBars
      
      // Draw vibrant sci-fi waveform
      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * bufferLength)
        const amplitude = (dataArray[dataIndex] / 255) * 1.2 // More vibrant
        
        // Enhanced pulsing effect for buttery smooth animation
        const pulse = Math.sin(animationTime * 4 + i * 0.15) * 0.2 + 1.0
        const secondaryPulse = Math.cos(animationTime * 2 + i * 0.08) * 0.1 + 1.0
        const height = (amplitude * canvas.height * 0.5 * pulse * secondaryPulse) + 4
        
        const x = i * barWidth + barWidth / 2
        
        // Create futuristic gradient with blue accents
        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${amplitude * 0.6 + 0.2})`)
        gradient.addColorStop(0.2, `rgba(147, 197, 253, ${amplitude * 0.8 + 0.3})`)
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${amplitude + 0.7})`)
        gradient.addColorStop(0.8, `rgba(147, 197, 253, ${amplitude * 0.8 + 0.3})`)
        gradient.addColorStop(1, `rgba(59, 130, 246, ${amplitude * 0.6 + 0.2})`)
        
        // Draw main bars
        ctx.fillStyle = gradient
        ctx.fillRect(x - barWidth * 0.3, centerY - height, barWidth * 0.6, height * 2)
        
        // Enhanced vibrant glow effect
        ctx.shadowColor = `rgba(59, 130, 246, ${amplitude * 1.2 + 0.3})`
        ctx.shadowBlur = 25
        ctx.fillRect(x - barWidth * 0.2, centerY - height * 0.8, barWidth * 0.4, height * 1.6)
        
        // Additional inner glow for more vibrancy
        ctx.shadowColor = `rgba(147, 197, 253, ${amplitude * 0.8 + 0.4})`
        ctx.shadowBlur = 15
        ctx.fillRect(x - barWidth * 0.15, centerY - height * 0.6, barWidth * 0.3, height * 1.2)
        ctx.shadowBlur = 0
        
        // Optimized particle effects for high frequencies
        if (amplitude > 0.7 && i % 2 === 0) { // Reduced frequency and only every other bar
          const particles = Math.floor(amplitude * 3) // Reduced particle count
          for (let p = 0; p < particles; p++) {
            const px = x + (Math.random() - 0.5) * barWidth
            const py = centerY + (Math.random() - 0.5) * height * 2
            const size = Math.random() * 1.5 + 0.5
            
            ctx.fillStyle = `rgba(59, 130, 246, ${Math.random() * 0.6 + 0.4})`
            ctx.beginPath()
            ctx.arc(px, py, size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      
      // Add blue scanning line effect
      const scanX = (Math.sin(animationTime * 2) * 0.5 + 0.5) * canvas.width
      const scanGradient = ctx.createLinearGradient(scanX - 20, 0, scanX + 20, 0)
      scanGradient.addColorStop(0, 'rgba(59, 130, 246, 0)')
      scanGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
      scanGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      
      ctx.fillStyle = scanGradient
      ctx.fillRect(scanX - 20, 0, 40, canvas.height)
      
      // Add blue border glow
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)
    }
    render()
  }

  const pause = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t: MediaStreamTrack) => (t.enabled = false))
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    setStatus('paused')
  }

  const resume = async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.start() } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t: MediaStreamTrack) => (t.enabled = true))
    } else {
      await start()
    }
    setStatus('recording')
  }

  const stop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop())
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    
    // Auto-transcribe any remaining interim text
    setInterim(prev => {
      if (prev) {
        setFinalText(current => (current ? current + ' ' + prev : prev))
        return ''
      }
      return prev
    })
    
    setStatus('stopped')
  }

  const clearAll = () => {
    setInterim('')
    setFinalText('')
    setStatus('idle')
    // Clear tracking references to prevent issues
    lastFinalTextRef.current = ''
    processedResultsRef.current.clear()
  }

  return (
    <div className="recorder">
      <div className="left">
        <div className="panel">
          {status === 'recording' && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              Recording
            </div>
          )}
          <canvas ref={canvasRef} width={600} height={120} className="wave" />
          <div className="buttons">
            {status !== 'recording' && <button className="btn record" onClick={start}>Start</button>}
            {status === 'recording' && <button className="btn pause" onClick={pause}>Pause</button>}
            {status === 'paused' && <button className="btn resume" onClick={resume}>Resume</button>}
            <button className="btn stop" onClick={stop}>Stop</button>
            <button className="btn clear" onClick={clearAll}>Clear</button>
          </div>
          <div className="lang-selector">
            <div className="lang-label">Language</div>
            <div className="lang-buttons" data-active={lang}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`lang-btn ${lang === language.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={status === 'recording'}
                >
                  <span className="lang-flag">{language.flag}</span>
                  <span className="lang-name">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="right">
        <div className="panel transcript">
          <h2>📝 Transcript</h2>
          <div className="largeText">
            {finalText && (
              <div style={{ marginBottom: '16px', opacity: 1 }}>
                {finalText}
              </div>
            )}
            {interim && (
              <div style={{ opacity: 0.7, fontStyle: 'italic' }}>
                {interim}
              </div>
            )}
            {!finalText && !interim && (
              <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '60px' }}>
                🎤 Start recording to see your speech transcribed here...
                <br />
                <small>⚡ Super fast auto-transcription after 0.7 seconds of silence</small>
                <br />
                <small>💻 Optimized for coding terminology and technical words</small>
                <br />
                <small>🌐 Select your language: English, Nepali, or Hindi</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
