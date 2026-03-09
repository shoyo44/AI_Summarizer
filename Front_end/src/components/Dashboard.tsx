import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { Usecase, UserInfo, HistoryItem, AnalyticsData } from '../lib/api'
import Analyzer from './Analyzer'
import History from './History'
import Analytics from './Analytics'
import './Dashboard.css'

const ABOUT_USECASES = [
  { icon: '🎯', name: 'Key Points Extraction', desc: 'Distills the most critical points from any text, filtering noise to present essential takeaways.' },
  { icon: '❓', name: 'Intelligent Question Generation', desc: 'Generates thought-provoking questions for study guides, interviews, or self-assessment.' },
  { icon: '📊', name: 'Executive Summary', desc: 'Produces polished summaries for decision-makers — covering the what, why, and so-what.' },
  { icon: '💡', name: 'Simplified Explanation (ELI5)', desc: 'Transforms complex content into plain, everyday language anyone can understand.' },
  { icon: '✅', name: 'Action Items & Next Steps', desc: 'Scans for actionable tasks and organizes them into a prioritized checklist.' },
  { icon: '🎭', name: 'Sentiment & Tone Analysis', desc: 'Analyzes emotional undertone, authorial intent, and overall sentiment.' },
  { icon: '⚖️', name: 'Pros & Cons Analysis', desc: 'Identifies advantages and disadvantages for a balanced, two-sided view.' },
  { icon: '📅', name: 'Timeline & Event Extraction', desc: 'Reconstructs chronological events into a clear, ordered timeline.' },
  { icon: '🏷️', name: 'Keywords & Topic Tagging', desc: 'Extracts dominant keywords, themes, and classification tags.' },
  { icon: '📝', name: 'Study Flashcard Generation', desc: 'Creates effective study flashcards using proven learning science principles.' },
  { icon: '🔍', name: 'Fact vs. Opinion Separator', desc: 'Distinguishes between verifiable facts, opinions, and unverified claims.' },
  { icon: '📋', name: 'Structured Comparison Table', desc: 'Constructs side-by-side comparison tables across relevant criteria.' },
  { icon: '🧐', name: 'Critical Analysis', desc: 'Evaluates argument strength, identifies gaps, and spots potential biases.' },
  { icon: '🌍', name: 'Multilingual Summary', desc: 'Creates summaries with culturally appropriate translations into other languages.' },
  { icon: '🧠', name: 'Hierarchical Mind Map', desc: 'Deconstructs text into a hierarchical knowledge structure.' },
  { icon: '📚', name: 'Multiple-Choice Quiz Generator', desc: 'Generates well-crafted quizzes with explanations for assessment.' },
  { icon: '📖', name: 'Glossary & Key Terms', desc: 'Identifies specialized vocabulary and provides clear definitions.' },
  { icon: '📈', name: 'SWOT Analysis', desc: 'Categorizes information into Strengths, Weaknesses, Opportunities, and Threats.' },
  { icon: '🎨', name: 'AI Image Generation', desc: 'Generate stunning images from text descriptions using AI-powered image synthesis.' },
]

export default function Dashboard() {
  const { signOut, getToken } = useAuth()
  const [usecases, setUsecases] = useState<Usecase[]>([])
  const [_userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history' | 'analytics'>('analyzer')
  const [reuseData, setReuseData] = useState<{ text: string; usecase: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'history') {
      refreshHistory()
    }
  }, [activeTab])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usecasesData, token] = await Promise.all([
        api.getUsecases(),
        getToken()
      ])

      setUsecases(usecasesData)

      if (token) {
        const [userInfoData, historyData, analyticsData] = await Promise.all([
          api.getCurrentUser(token),
          api.getHistory(token),
          api.getAnalytics(token)
        ])
        setUserInfo(userInfoData)
        setHistory(historyData)
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshHistory = async () => {
    const token = await getToken()
    if (token) {
      const historyData = await api.getHistory(token)
      setHistory(historyData)
      const userInfoData = await api.getCurrentUser(token)
      setUserInfo(userInfoData)
      const analyticsData = await api.getAnalytics(token)
      setAnalytics(analyticsData)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <header className="top-navbar">
        <div className="nav-left">
          <div className="nav-logo">
            {activeTab === 'history' || activeTab === 'analytics' ? (
              <button className="back-btn" onClick={() => setActiveTab('analyzer')} title="Back to Analyzer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            ) : (
              <img src="/ai-summarizer-logo.png" alt="AI Summarizer" className="nav-logo-img" />
            )}
          </div>
          <h1>
            {activeTab === 'history' && 'History'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'analyzer' && 'AI Summarizer'}
          </h1>
        </div>

        <div className="nav-right" ref={menuRef}>
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle Menu"
            aria-expanded={showMenu}
            aria-haspopup="true"
            title="Toggle Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <title>Menu</title>
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="nav-dropdown-menu">
              <button className="nav-dropdown-item" onClick={() => { setShowMenu(false); setActiveTab(activeTab === 'history' ? 'analyzer' : 'history') }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                History
              </button>
              <button className="nav-dropdown-item" onClick={() => { setShowMenu(false); setActiveTab('analytics') }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
                Analytics
              </button>
              <button className="nav-dropdown-item" onClick={() => { setShowMenu(false); setShowAbout(true) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                About AI Summarizer
              </button>
              <div className="nav-dropdown-divider" />
              <button className="nav-dropdown-item nav-dropdown-item-danger" onClick={() => { setShowMenu(false); signOut() }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-container">
        {activeTab === 'analyzer' && (
          <Analyzer
            usecases={usecases}
            onAnalysisComplete={refreshHistory}
            initialText={reuseData?.text}
            initialUsecase={reuseData?.usecase}
          />
        )}
        {activeTab === 'history' && (
          <History
            history={history}
            onRefresh={refreshHistory}
            onReuse={(text, usecase) => {
              setReuseData({ text, usecase })
              setActiveTab('analyzer')
            }}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics data={analytics} total={_userInfo?.total_analyses || 0} onExit={() => setActiveTab('analyzer')} />
        )}
      </main>

      {/* About Modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-logo-section">
                <img src="/ai-summarizer-logo.png" alt="AI Summarizer" className="modal-logo" />
                <div>
                  <h2>AI Summarizer</h2>
                  <p className="modal-tagline">Your Creative AI Assistant</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAbout(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="modal-description">
              A comprehensive AI-powered text analysis tool. Given any text — articles, reports, meeting notes, research papers —
              this tool applies various analytical lenses to extract maximum value and insight.
            </p>

            <h3 className="modal-section-title">
              <span className="section-icon">✨</span>
              Use Cases ({ABOUT_USECASES.length})
            </h3>

            <div className="usecases-grid">
              {ABOUT_USECASES.map((uc, i) => (
                <div key={i} className="usecase-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <span className="usecase-icon">{uc.icon}</span>
                  <div>
                    <h4>{uc.name}</h4>
                    <p>{uc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div>
                <span className="version-badge">v1.0</span>
                <span className="powered-by">Powered by Gemini AI</span>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                style={{ backgroundColor: '#f87171', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Exit Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
