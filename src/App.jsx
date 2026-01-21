import { useState, useRef } from 'react'
import './index.css'
import Editor from './components/Editor/Editor'
import Preview from './components/Preview/Preview'
import Controls from './components/Controls/Controls'

function App() {
  const [settings, setSettings] = useState({
    format: 'simple', // 'simple' | 'double'
    image: null,
    title: '',
    body: ''
  });

  const previewRef = useRef(null);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
            Social Media <span style={{ color: 'var(--accent-color)' }}>Generator</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CEX Vibe Coding Tool</p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="app-main">

        {/* Editor Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <Editor settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Preview Column */}
        <div className="preview-section">
          <div className="preview-card">
            {/* Scaler handles mobile resizing without affecting 4:5 aspect ratio structure */}
            <div className="preview-scaler">
              <Preview ref={previewRef} settings={settings} />
            </div>
          </div>

          <Controls previewRef={previewRef} fileName={settings.title || 'social-post'} />
        </div>
      </main>
    </div>
  )
}

export default App
