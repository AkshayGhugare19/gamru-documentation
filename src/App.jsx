import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Architecture from './pages/Architecture'
import AuthPage from './pages/AuthPage'
import IntegrationGuide from './pages/IntegrationGuide'
import FlowPage from './pages/FlowPage'
import ApiPage from './pages/ApiPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/integration" element={<IntegrationGuide />} />
          <Route path="/flows/:id" element={<FlowPage />} />
          <Route path="/api/gamru" element={<ApiPage platform="gamru" />} />
          <Route path="/api/games" element={<ApiPage platform="games" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
