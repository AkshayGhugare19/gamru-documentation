import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import UserHome from './pages/user/UserHome'
import UseGamruService from './pages/UseGamruService'
import GamruServiceApi from './pages/GamruServiceApi'
import WidgetsGuide from './pages/user/WidgetsGuide'
import WidgetTypePage from './pages/user/WidgetTypePage'
import UserMissionsTournaments from './pages/user/MissionsTournaments'
import UserCampaigns from './pages/user/Campaigns'
import AdminHome from './pages/admin/AdminHome'
import AdminApi from './pages/admin/AdminApi'
import WidgetsManage from './pages/admin/WidgetsManage'
import AdminMissionsTournaments from './pages/admin/MissionsTournaments'
import AdminCampaigns from './pages/admin/Campaigns'
import ApiPage from './pages/ApiPage'
import EndpointPage from './pages/EndpointPage'
import TestingBox from './pages/TestingBox'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* USER panel — integrate Gamru & let players use it */}
          <Route path="/user" element={<UserHome />} />
          <Route path="/user/integrate" element={<UseGamruService />} />
          <Route path="/user/widgets" element={<WidgetsGuide />} />
          <Route path="/user/widgets/:type" element={<WidgetTypePage />} />
          <Route path="/user/missions-tournaments" element={<UserMissionsTournaments />} />
          <Route path="/user/campaigns" element={<UserCampaigns />} />
          <Route path="/user/api" element={<GamruServiceApi />} />
          <Route path="/user/endpoints" element={<ApiPage platform="gamru" audience="user" />} />
          <Route path="/user/endpoints/:id" element={<EndpointPage />} />
          <Route path="/user/testing" element={<TestingBox audience="user" />} />

          {/* ADMIN panel — manage everything in Gamru */}
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/api" element={<AdminApi />} />
          <Route path="/admin/missions-tournaments" element={<AdminMissionsTournaments />} />
          <Route path="/admin/campaigns" element={<AdminCampaigns />} />
          <Route path="/admin/widgets" element={<WidgetsManage />} />
          <Route path="/admin/endpoints" element={<ApiPage platform="gamru" audience="admin" />} />
          <Route path="/admin/endpoints/:id" element={<EndpointPage />} />
          <Route path="/admin/testing" element={<TestingBox audience="admin" />} />

          <Route path="*" element={<Landing />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
