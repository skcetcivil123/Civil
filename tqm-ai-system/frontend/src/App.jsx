/**
 * Root application — React Router v6 layout with Sidebar + TopBar.
 * All 25 Phases connected with rich, interactive research components.
 */
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Factors from './pages/Factors'
import Experts from './pages/Experts'
import Fdm from './pages/Fdm'
import Questionnaire from './pages/Questionnaire'
import Survey from './pages/Survey'
import Statistics from './pages/Statistics'
import Reliability from './pages/Reliability'
import Kmo from './pages/Kmo'
import Efa from './pages/Efa'
import Anova from './pages/Anova'
import Framework from './pages/Framework'
import MachineLearning from './pages/MachineLearning'
import Xai from './pages/Xai'
import Recommendations from './pages/Recommendations'
import Chatbot from './pages/Chatbot'
import Viva from './pages/Viva'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import QualityAudit from './pages/QualityAudit'
import ComingSoon from './pages/ComingSoon'
import AIAssistantDrawer from './components/AIAssistantDrawer'
import { 
  healthApi, factorsApi, fdmApi, surveyApi, statisticsApi, mlApi, reportsApi 
} from './api/client'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemHealth, setSystemHealth] = useState(null)

  // Global health poll every 30s
  useEffect(() => {
    const fetchHealth = () => {
      healthApi.get()
        .then(r => setSystemHealth(r.data))
        .catch(() => setSystemHealth({ status: 'error', mongodb: 'disconnected' }))
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  // Pre-warm in-memory cache in background for instantaneous (0ms) page switching
  useEffect(() => {
    factorsApi.getAll().catch(() => {})
    fdmApi.getExperts().catch(() => {})
    surveyApi.getResponses().catch(() => {})
    statisticsApi.getRII().catch(() => {})
    statisticsApi.getReliability().catch(() => {})
    statisticsApi.getKMO().catch(() => {})
    statisticsApi.getEFA().catch(() => {})
    statisticsApi.getANOVA().catch(() => {})
    statisticsApi.getFramework().catch(() => {})
    mlApi.getModels().catch(() => {})
    reportsApi.getSummary().catch(() => {})
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <BrowserRouter>
      <div className="app-shell">

        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <div className="app-main">
          <TopBar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            systemHealth={systemHealth}
          />

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Research Methodology Routes */}
              <Route path="/literature" element={<Factors />} />
              <Route path="/factors" element={<Factors />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/fdm" element={<Fdm />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/survey" element={<Survey />} />

              {/* Statistical Analysis Routes */}
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/rii" element={<Statistics />} />
              <Route path="/reliability" element={<Reliability />} />
              <Route path="/kmo" element={<Kmo />} />
              <Route path="/efa" element={<Efa />} />
              <Route path="/anova" element={<Anova />} />
              <Route path="/framework" element={<Framework />} />

              {/* AI & Intelligence Routes */}
              <Route path="/ml" element={<MachineLearning />} />
              <Route path="/models" element={<MachineLearning />} />
              <Route path="/xai" element={<Xai />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/viva" element={<Viva />} />

              {/* Reports & Governance */}
              <Route path="/audit" element={<QualityAudit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />

              {/* 404 Fallback */}
              <Route path="*" element={
                <ComingSoon
                  title="Page Not Found"
                  description="This page doesn't exist. Use the navigation on the left to continue."
                />
              } />
            </Routes>
          </main>
        </div>
      </div>

      {/* Global Context-Aware AI Assistant Drawer */}
      <AIAssistantDrawer />
    </BrowserRouter>
  )
}
