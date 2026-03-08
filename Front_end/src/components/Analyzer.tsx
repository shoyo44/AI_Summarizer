import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { Usecase } from '../lib/api'
import { parseFile, validateFile } from '../lib/fileParser'
import './Analyzer.css'
interface AnalyzerProps {
  usecases: Usecase[]
  onAnalysisComplete: () => void
  initialText?: string
  initialUsecase?: string
}

export default function Analyzer({ usecases, onAnalysisComplete, initialText, initialUsecase }: AnalyzerProps) {
  const { getToken } = useAuth()
  const [text, setText] = useState('')
  const [selectedUsecase, setSelectedUsecase] = useState(usecases[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState('')
  const [sharing, setSharing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialText !== undefined) {
      setText(initialText)
    }
    if (initialUsecase !== undefined) {
      setSelectedUsecase(initialUsecase)
    }
  }, [initialText, initialUsecase])

  const selectedUsecaseData = usecases.find(uc => uc.id === selectedUsecase)
  const isImageResult = result.startsWith('data:image/')

  const handleDownloadImage = () => {
    if (!isImageResult) return
    const link = document.createElement('a')
    link.href = result
    link.download = `ai-generated-${Date.now()}.png`
    link.click()
  }

  const filteredUsecases = usecases.filter(uc =>
    uc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uc.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file type or size')
      return
    }

    try {
      setIsParsing(true)
      setError('')
      const result = await parseFile(file)
      setText(prev => prev ? `${prev}\n\n${result.text}` : result.text)
    } catch (err: any) {
      setError(err.message || 'Failed to parse file')
    } finally {
      setIsParsing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim() || !selectedUsecase) return

    try {
      setLoading(true)
      setError('')
      setResult('')

      const token = await getToken()
      if (!token) throw new Error('Not authenticated')


      const response = await api.analyze({
        text,
        usecase_id: selectedUsecase,
      }, token)

      setResult(response.result)
      setCurrentHistoryId(response.history_id || null)
      setShareLink('')
      onAnalysisComplete()
    } catch (err: any) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResult('')
    setError('')
    setCurrentHistoryId(null)
    setShareLink('')
  }

  const handleShare = async () => {
    if (!currentHistoryId) return
    try {
      setSharing(true)
      const token = await getToken()
      if (token) {
        const { share_id } = await api.shareHistoryItem(currentHistoryId, token)
        const link = `${window.location.origin}/shared/${share_id}`
        setShareLink(link)
        navigator.clipboard.writeText(link)
      }
    } catch (err) {
      console.error('Failed to share:', err)
    } finally {
      setSharing(false)
    }
  }

  const handleExportPDF = async () => {
    if (!result || isImageResult) return
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; color: #000; background-color: #fff;">
        <h2 style="color: #000;">AI Analysis - ${selectedUsecaseData?.name || 'Summary'}</h2>
        <pre style="font-family: sans-serif; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #000;">${result}</pre>
      </div>
    `
    html2pdf().set({
      margin: 15,
      filename: `analysis_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save()
  }

  const handleExportMarkdown = () => {
    if (!result || isImageResult) return
    const textBlob = `## AI Analysis - ${selectedUsecaseData?.name || 'Summary'}\n\n${result}`
    const blob = new Blob([textBlob], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis_${Date.now()}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getUsecaseIcon = (name: string) => {
    if (name.includes('Image')) return '🎨'
    if (name.includes('Blog')) return '🛡️'
    if (name.includes('Email')) return '🤍'
    if (name.includes('Bridge')) return '💜'
    if (name.includes('Phrase')) return '💜'
    return '✨'
  }

  return (
    <div className="analyzer-container">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Content Generation</h2>
          <p>Select a role and provide your input to generate AI-powered content.</p>
        </div>

        <div className="roles-section">
          <div className="roles-header">
            <span className="roles-icon">🛡️</span>
            <h3>Select Role</h3>
          </div>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="roles-list">
            {usecases.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                <p>No roles loaded. Ensure the backend server is running.</p>
              </div>
            ) : filteredUsecases.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                <p>No roles match your search.</p>
              </div>
            ) : (
              filteredUsecases.map(uc => (
                <div
                  key={uc.id}
                  className={`role-card ${selectedUsecase === uc.id ? 'active' : ''}`}
                  onClick={() => setSelectedUsecase(uc.id)}
                >
                  <div className="role-card-header">
                    <h4>{uc.name}</h4>
                    <span className="role-icon">{getUsecaseIcon(uc.name)}</span>
                  </div>
                  <p>{uc.description}</p>
                  {selectedUsecase === uc.id && <div className="active-indicator">✓</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="input-section">
          <div className="section-label">
            <span className="icon">✍️</span>
            <h3>Input</h3>
          </div>
          <div className="using-role">
            Using: <span>{selectedUsecaseData?.name || 'Select a role'}</span>
          </div>

          <div className="textarea-wrapper">
            <textarea
              placeholder="Enter your request here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isParsing || loading}
            />

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />

            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PDF, Word, or TXT file"
              disabled={isParsing || loading}
            >
              {isParsing ? '⏳' : '➕'}
            </button>

            <div className="char-count">{text.length} characters</div>
          </div>

          <button
            className="generate-btn"
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Generating...' : '✨ Generate'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="output-section">
          <div className="output-header">
            <div className="output-title">
              <span className="icon">{isImageResult ? '🖼️' : '📄'}</span>
              <h3>Output</h3>
              {result && !isImageResult && <span className="output-chars">{result.length} chars</span>}
              {isImageResult && <span className="output-chars">Image Generated</span>}
            </div>
            <div className="output-actions">
              {isImageResult ? (
                <button
                  className="action-btn"
                  onClick={handleDownloadImage}
                >
                  ⬇️ Download
                </button>
              ) : (
                <>
                  <button className="action-btn" onClick={handleShare} disabled={!result || !currentHistoryId || sharing} title={shareLink ? 'Link copied!' : 'Generate public link'} style={{ color: shareLink ? '#f59e0b' : '' }}>
                    {sharing ? '⏳' : (shareLink ? '✅ Copied' : '🔗 Share')}
                  </button>
                  <div className="download-dropdown">
                    <button className="action-btn" disabled={!result} title="Download options">⬇️ Download</button>
                    {result && (
                      <div className="dropdown-menu">
                        <button onClick={handleExportPDF} title="Download inside PDF format">📄 PDF</button>
                        <button onClick={handleExportMarkdown} title="Download inside MD format">📝 MD</button>
                      </div>
                    )}
                  </div>
                  <button
                    className="action-btn"
                    onClick={() => navigator.clipboard.writeText(result)}
                    disabled={!result}
                  >
                    📋 Copy
                  </button>
                </>
              )}
              <button
                className="action-btn btn-clear"
                onClick={handleClear}
                disabled={!text && !result}
              >
                ✕ Clear
              </button>
            </div>
          </div>

          <div className="output-content">
            {loading ? (
              <div className="loading-state">{selectedUsecase === 'image_generation' ? 'Generating image...' : 'Processing...'}</div>
            ) : isImageResult ? (
              <div className="result-image-container">
                <img src={result} alt="AI Generated" className="result-image" />
              </div>
            ) : result ? (
              <div className="result-text">{result}</div>
            ) : (
              <div className="empty-state">{selectedUsecase === 'image_generation' ? 'Describe an image and click Generate' : 'Generated content will appear here'}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
