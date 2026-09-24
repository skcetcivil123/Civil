import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bot, Send, User, Sparkles, BookOpen, MessageSquare, Trash2, ArrowRight,
  Layers, Compass, ExternalLink, HelpCircle, Check, Eye, EyeOff, LayoutDashboard,
  Calculator, Users, ClipboardList, FileSpreadsheet, BarChart2, ShieldCheck,
  CheckCircle2, BrainCircuit, Lightbulb, GraduationCap, FileText, Settings, Key
} from 'lucide-react'
import { chatbotApi } from '../api/client'
import { PageHeader, Alert } from '../components/ui'

const RESEARCH_MODULES = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, query: "Explain the Dashboard screen", tag: "dashboard", desc: "Central control cockpit showing health of all 6 research phases." }
    ]
  },
  {
    group: "Research Foundation",
    items: [
      { name: "Literature & Factors", path: "/factors", icon: BookOpen, query: "Explain the Literature & Factors screen", tag: "factors", desc: "16 critical factors (8 CSFs & 8 Barriers) screened from literature." },
      { name: "FDM Expert Panel", path: "/experts", icon: Users, query: "Explain the Expert Panel screen", tag: "experts", desc: "10 Coimbatore industry & academic masters with 15-25+ years experience." },
      { name: "FDM Consensus Engine", path: "/fdm", icon: Calculator, query: "Explain the FDM Consensus screen", tag: "fdm", desc: "Fuzzy Delphi calculations using Triangular Fuzzy Numbers and 0.70 threshold." },
      { name: "Survey Instrument", path: "/questionnaire", icon: ClipboardList, query: "Explain the Survey Instrument screen", tag: "questionnaire", desc: "5-point Likert questionnaire design (1=Strongly Disagree, 5=Strongly Agree)." },
      { name: "Data Collection (N=120)", path: "/survey", icon: FileSpreadsheet, query: "Explain the Data Collection screen", tag: "survey", desc: "Verified field responses from 120 construction engineers in Coimbatore." }
    ]
  },
  {
    group: "Statistical Analysis",
    items: [
      { name: "Descriptive & RII", path: "/statistics", icon: BarChart2, query: "Explain the Descriptive & RII screen", tag: "statistics", desc: "Relative Importance Index ranking leaderboard of all 16 variables." },
      { name: "Reliability (Cronbach α)", path: "/reliability", icon: ShieldCheck, query: "Explain the Reliability screen", tag: "reliability", desc: "Internal consistency test (Alpha = 0.759 > 0.70 benchmark)." },
      { name: "Suitability (KMO/Bartlett)", path: "/kmo", icon: CheckCircle2, query: "Explain the KMO Suitability screen", tag: "kmo", desc: "Sampling adequacy green light (KMO = 0.835, Bartlett p < 0.001)." },
      { name: "Factor Structure (EFA)", path: "/efa", icon: Layers, query: "Explain the Factor Structure (EFA) screen", tag: "efa", desc: "4 latent dimensions extracted via Varimax rotation (62.4% variance)." },
      { name: "Group Comparison (ANOVA)", path: "/anova", icon: BarChart2, query: "Explain the ANOVA screen", tag: "anova", desc: "Cross-group hypothesis testing across experience, firm size, and project type." }
    ]
  },
  {
    group: "Framework & Machine Learning",
    items: [
      { name: "4-Tier TQM Framework", path: "/framework", icon: Compass, query: "Explain the 4-Tier TQM Framework screen", tag: "framework", desc: "Prioritized implementation pyramid for construction companies." },
      { name: "Action Roadmaps", path: "/recommendations", icon: Lightbulb, query: "Explain the Recommendations screen", tag: "recommendations", desc: "12-month step-by-step rollout calendar for contractors." },
      { name: "Predictive ML Models", path: "/ml", icon: BrainCircuit, query: "Explain the Machine Learning screen", tag: "ml", desc: "XGBoost, Random Forest & Decision Tree predictors (86.7% accuracy)." },
      { name: "SHAP Explainability", path: "/xai", icon: Sparkles, query: "Explain the SHAP Explainability screen", tag: "xai", desc: "Transparent XAI feature attribution opening the black box." }
    ]
  },
  {
    group: "Assistant & Viva Defense",
    items: [
      { name: "AI Research Assistant", path: "/chatbot", icon: MessageSquare, query: "What can this AI assistant do?", tag: "chatbot", desc: "Offline, zero-hallucination research expert with 300+ concept entries." },
      { name: "Viva Voce Simulator", path: "/viva", icon: GraduationCap, query: "Explain the Viva Voce screen", tag: "viva", desc: "Interactive oral defense exam practice with AI scorecards & examiner intent." },
      { name: "Reports & CSV Export", path: "/reports", icon: FileText, query: "Explain the Reports screen", tag: "reports", desc: "Executive summary generation and 120-row raw empirical CSV download." }
    ]
  },
  {
    group: "Administration",
    items: [
      { name: "System Settings", path: "/admin", icon: Settings, query: "Explain the Admin screen", tag: "admin", desc: "Dual-mode database telemetry, cache purger, and factor inventory." },
      { name: "Account & Roles", path: "/auth", icon: Key, query: "Explain the Auth screen", tag: "auth", desc: "RBAC session switching across 6 academic user profiles (password: secret)." }
    ]
  }
]

function renderInlineText(str) {
  if (!str) return ''
  const tokens = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} style={{ color: '#0F172A', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <span key={idx} style={{ color: 'var(--orange-dark)', fontWeight: 600, marginRight: 4 }}>
          {token.slice(1, -1)}
        </span>
      )
    }
    return token
  })
}

function FormattedAnswer({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  const nodes = []
  let pendingBullets = []

  const flushBullets = () => {
    if (pendingBullets.length > 0) {
      nodes.push(
        <div key={`list-${nodes.length}`} style={{ margin: '8px 0 10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pendingBullets.map((b, bi) => (
            <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.9rem', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--orange)', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.4' }}>•</span>
              <div style={{ flex: 1, color: '#334155' }}>{renderInlineText(b)}</div>
            </div>
          ))}
        </div>
      )
      pendingBullets = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushBullets()
      return
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      pendingBullets.push(trimmed.slice(2))
      return
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      flushBullets()
      nodes.push(
        <div key={`num-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '6px 0', fontSize: '0.9rem', lineHeight: 1.55 }}>
          <span style={{
            background: 'var(--orange-mid)', color: 'var(--orange-dark)',
            borderRadius: '50%', width: 22, height: 22, minWidth: 22, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
          }}>
            {numMatch[1]}
          </span>
          <div style={{ flex: 1, color: '#334155' }}>{renderInlineText(numMatch[2])}</div>
        </div>
      )
      return
    }

    flushBullets()

    if (trimmed.startsWith('📌') || trimmed.startsWith('🏠') || trimmed.startsWith('📚') || trimmed.startsWith('👷') || trimmed.startsWith('🎯') || trimmed.startsWith('📋') || trimmed.startsWith('📊') || trimmed.startsWith('🏆') || trimmed.startsWith('🔬') || trimmed.startsWith('🧪') || trimmed.startsWith('🧩') || trimmed.startsWith('👥') || trimmed.startsWith('🏛️') || trimmed.startsWith('🗺️') || trimmed.startsWith('🤖') || trimmed.startsWith('🔍') || trimmed.startsWith('📑') || trimmed.startsWith('🎓') || trimmed.startsWith('⚙️') || trimmed.startsWith('🔐')) {
      nodes.push(
        <div key={`title-${i}`} style={{
          fontSize: '1.02rem',
          fontWeight: 700,
          color: '#0F172A',
          paddingBottom: 8,
          marginBottom: 8,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {renderInlineText(trimmed)}
        </div>
      )
      return
    }

    nodes.push(
      <p key={`p-${i}`} style={{ margin: '6px 0', fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
        {renderInlineText(trimmed)}
      </p>
    )
  })

  flushBullets()
  return <div>{nodes}</div>
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 **Welcome to your TQM Research Assistant!**\n\nNo typing required! You can click any feature below to get an instant explanation in simple, easy-to-understand terms. Everything is calculated and verified offline.",
      sources: ["Dissertation Overview", "Research Pipeline Methodology"],
      followups: [
        "Explain the Dashboard screen",
        "Explain the Literature & Factors screen",
        "Explain the 4-Tier TQM Framework screen",
        "Explain the Predictive ML Models screen"
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('simple') // 'simple' or 'research'
  const [hideTextBox, setHideTextBox] = useState(false)
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendQuery = (textToSend, screenTag = null, queryMode = mode) => {
    const trimmed = (textToSend || '').trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    chatbotApi.query(trimmed, screenTag, 'default', queryMode)
      .then(res => {
        const botMsg = {
          role: 'assistant',
          text: res.data.response,
          sources: res.data.sources || [],
          followups: res.data.suggested_followups || []
        }
        setMessages(prev => [...prev, botMsg])
        setLoading(false)
        if (!hideTextBox) {
          inputRef.current?.focus()
        }
      })
      .catch(() => {
        const errMsg = {
          role: 'assistant',
          text: "I encountered a communication issue with the local knowledge engine. Please ensure the backend server is running.",
          sources: [],
          followups: ["Explain the Dashboard screen", "Explain the Literature & Factors screen"]
        }
        setMessages(prev => [...prev, errMsg])
        setLoading(false)
      })
  }

  const handleSendForm = (e) => {
    e.preventDefault()
    sendQuery(input, null, mode)
  }

  const handleFeatureClick = (item) => {
    const query = mode === 'simple' 
      ? `Explain ${item.name} in simple terms`
      : item.query
    sendQuery(query, item.tag, mode)
  }

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: "Conversation cleared. Click any feature button above to learn about that topic!",
        sources: ["Knowledge Base"],
        followups: ["Explain the Dashboard screen", "Explain the 4-Tier TQM Framework screen"]
      }
    ])
  }

  const activeGroup = RESEARCH_MODULES[activeGroupIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxHeight: 920 }}>
      <PageHeader
        title="AI Research Assistant — Interactive Feature Guide"
        subtitle="Explore all 19 research modules with 1-click simple explanations. No typing required!"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className={`btn btn-sm ${mode === 'simple' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('simple')}
              title="Explain in kid-friendly, simple terms"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span>🧒</span> Simple Mode
            </button>
            <button 
              className={`btn btn-sm ${mode === 'research' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('research')}
              title="Explain in academic research & thesis terms"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span>🎓</span> Academic Mode
            </button>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setHideTextBox(h => !h)}
              title={hideTextBox ? "Restore manual text input" : "Hide text box for click-only exploration"}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {hideTextBox ? <Eye size={13} /> : <EyeOff size={13} />}
              {hideTextBox ? "Show Text Box" : "No Text Box"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleClear} title="Clear chat history">
              <Trash2 size={14} style={{ marginRight: 4 }} />
              Clear
            </button>
          </div>
        }
      />

      {/* Structured Category Tabs (No Typing Needed) */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Click Any Feature to Explain (Mode: <span style={{ color: 'var(--orange)' }}>{mode === 'simple' ? '🧒 Simple Terms' : '🎓 Academic Research'}</span>)
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            19 Interactive Research Modules
          </span>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
          {RESEARCH_MODULES.map((g, idx) => (
            <button
              key={idx}
              onClick={() => setActiveGroupIndex(idx)}
              className={`btn btn-sm ${activeGroupIndex === idx ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', padding: '5px 12px' }}
            >
              {g.group}
            </button>
          ))}
        </div>

        {/* Feature Cards in Active Category */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 8 }}>
          {activeGroup.items.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                <button
                  onClick={() => handleFeatureClick(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: 0
                  }}
                  title={item.desc}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'var(--orange-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={14} color="var(--orange)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--orange)', marginTop: 2 }}>
                      Click to Explain ✨
                    </div>
                  </div>
                </button>

                <Link 
                  to={item.path} 
                  title={`Open ${item.name} page`}
                  style={{
                    color: 'var(--text-muted)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} />
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Conversation Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.role === 'user' ? '75%' : '90%'
              }}
            >
              {m.role === 'assistant' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--orange)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={17} />
                </div>
              )}

              <div style={{
                background: m.role === 'user' ? 'var(--orange)' : '#FFFFFF',
                color: m.role === 'user' ? '#fff' : '#1E293B',
                padding: '14px 18px',
                borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                boxShadow: m.role === 'user' ? '0 2px 6px rgba(249,115,22,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
                maxWidth: '100%'
              }}>
                {m.role === 'user' ? (
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {m.text}
                  </div>
                ) : (
                  <FormattedAnswer text={m.text} />
                )}

                {/* Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #F1F5F9', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <BookOpen size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Citations:</span>
                    {m.sources.map((s, si) => (
                      <span key={si} className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested followups */}
                {m.followups && m.followups.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.followups.map((f, fi) => (
                      <button
                        key={fi}
                        onClick={() => sendQuery(f, null, mode)}
                        style={{
                          background: '#FFF7ED', border: '1px solid var(--orange-border)',
                          borderRadius: 12, padding: '3px 10px', fontSize: '0.74rem',
                          color: 'var(--orange-dark)', cursor: 'pointer', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500
                        }}
                      >
                        <Sparkles size={10} />
                        <span>{f}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--orange)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={15} />
              </div>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: 14, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Consulting offline research knowledge base...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form OR No-Text-Box Banner */}
        {hideTextBox ? (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={15} color="var(--orange)" />
              <span><strong>One-Click Feature Mode Active:</strong> Click any feature button above to explain it instantly without typing!</span>
            </div>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setHideTextBox(false)}
            >
              Show Text Box
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSendForm}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 10,
              background: 'var(--bg-card)',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="text-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask anything about TQM, FDM, RII, or Coimbatore... (Mode: ${mode === 'simple' ? 'Simple' : 'Academic'})`}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10 }}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ padding: '10px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={15} />
              <span>Ask</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
