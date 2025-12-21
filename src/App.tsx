import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useState } from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'
import FloatingCreateButton from './components/ui/FloatingCreateButton'
import CinematicDemo from './components/demo/CinematicDemo'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const HeritageStoriesPage = lazy(() => import('./pages/HeritageStoriesPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const UserCenterPage = lazy(() => import('./pages/UserCenterPage'))
const VRExperiencePage = lazy(() => import('./pages/VRExperiencePage'))
const GreenMarketplace = lazy(() => import('./pages/GreenMarketplace'))
const EcoPledgeWall = lazy(() => import('./pages/EcoPledgeWall'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const CreativeGalleryPage = lazy(() => import('./pages/CreativeGalleryPage'))

// 功能组件
const HeritageMap = lazy(() => import('./components/HeritageMap'))
const VirtualGallery = lazy(() => import('./components/VirtualGallery'))
const HeritageTimeline = lazy(() => import('./components/HeritageTimeline'))

// 非遗互动体验组件
const BambooWeavingGame = lazy(() => import('./components/experiences/BambooWeavingGame'))
const PaperCuttingV2 = lazy(() => import('./components/experiences/PaperCuttingV2'))
const HaniTerraceV2 = lazy(() => import('./components/experiences/HaniTerraceV2'))

// 陕西非遗体验组件
const ShadowPuppetV2 = lazy(() => import('./components/experiences/ShadowPuppetV2'))
// QinqiangFaceMask removed - not related to eco theme
// AnsaiDrum removed - not related to eco theme
// XianDrumMusic removed - not related to eco theme
const ClaySculptureV2 = lazy(() => import('./components/experiences/ClaySculptureV2'))

// 新增生态体验组件
const TeaCeremonyV2 = lazy(() => import('./components/experiences/TeaCeremonyV2'))
const BatikExperience = lazy(() => import('./components/experiences/BatikExperience'))
const RetroPolaroidCamera = lazy(() => import('./components/experiences/RetroPolaroidCamera'))
const EcoDigitalTwin = lazy(() => import('./components/experiences/EcoDigitalTwin'))

// 生态功能组件
const EcoKnowledgeGraph = lazy(() => import('./components/eco/EcoKnowledgeGraph'))
const SeasonalEcoActivity = lazy(() => import('./components/eco/SeasonalEcoActivity'))
const EcoAchievementNFT = lazy(() => import('./components/eco/EcoAchievementNFT'))
const EcoLearningPath = lazy(() => import('./components/eco/EcoLearningPath'))
const EcoStoryTimeline = lazy(() => import('./components/eco/EcoStoryTimeline'))

function App() {
  const [showDemo, setShowDemo] = useState(false)
  
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          {/* 全局悬浮创作按钮 */}
          <FloatingCreateButton />
          
          {/* 演示录制启动按钮 - 右下角位置避免遮挡 */}
          <button
            onClick={() => setShowDemo(true)}
            className="fixed bottom-24 right-6 z-[9998] flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-heritage-600 to-eco-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            开始演示
          </button>
          
          {/* 电影级演示控制器 */}
          <CinematicDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />
          <Routes>
            {/* 带 Layout 的页面 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="stories" element={<HeritageStoriesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="collection" element={<CollectionPage />} />
              <Route path="user" element={<UserCenterPage />} />
              <Route path="green-marketplace" element={<GreenMarketplace />} />
              <Route path="creative-gallery" element={<CreativeGalleryPage />} />
              <Route path="eco-pledge-wall" element={<EcoPledgeWall />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="knowledge-graph" element={<EcoKnowledgeGraph />} />
              <Route path="seasonal-activity" element={<SeasonalEcoActivity />} />
              <Route path="nft-collection" element={<EcoAchievementNFT />} />
              <Route path="learning-path" element={<EcoLearningPath />} />
              <Route path="eco-timeline" element={<EcoStoryTimeline />} />
            </Route>
            
            {/* 全屏沉浸式页面 */}
            <Route path="/map" element={<HeritageMap />} />
            <Route path="/gallery" element={<VirtualGallery />} />
            <Route path="/timeline" element={<HeritageTimeline />} />
            <Route path="/vr" element={<VRExperiencePage />} />
            
            {/* 非遗互动体验路由 */}
            <Route path="/experience/bamboo-weaving" element={<BambooWeavingGame />} />
            <Route path="/experience/paper-cutting" element={<PaperCuttingV2 />} />
            <Route path="/experience/hani-terrace" element={<HaniTerraceV2 />} />
            
            {/* 陕西非遗体验路由 */}
            <Route path="/experience/shadow-puppet" element={<ShadowPuppetV2 />} />
            {/* QinqiangFaceMask route removed - not related to eco theme */}
            {/* AnsaiDrum route removed - not related to eco theme */}
            {/* XianDrumMusic route removed - not related to eco theme */}
            <Route path="/experience/fengxiang-clay" element={<ClaySculptureV2 />} />
            
            {/* 新增生态体验路由 */}
            <Route path="/experience/tea-ceremony" element={<TeaCeremonyV2 />} />
            <Route path="/experience/batik" element={<BatikExperience />} />
            <Route path="/experience/ai-polaroid" element={<RetroPolaroidCamera />} />
            <Route path="/experience/digital-twin" element={<EcoDigitalTwin />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App
