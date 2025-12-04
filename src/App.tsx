import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const HeritageMap = lazy(() => import('./components/HeritageMap'))
const VirtualGallery = lazy(() => import('./components/VirtualGallery'))
const HeritageTimeline = lazy(() => import('./components/HeritageTimeline'))

// 非遗互动体验组件
const BambooWeavingGame = lazy(() => import('./components/experiences/BambooWeavingGame'))
const PaperCuttingGame = lazy(() => import('./components/experiences/PaperCuttingGame'))
const HaniTerracePanorama = lazy(() => import('./components/experiences/HaniTerracePanorama'))

// 陕西非遗体验组件
const ShadowPuppetShow = lazy(() => import('./components/experiences/ShadowPuppetShow'))
const QinqiangFaceMask = lazy(() => import('./components/experiences/QinqiangFaceMaskWebGL'))
const AnsaiDrum = lazy(() => import('./components/experiences/AnsaiDrum'))
const XianDrumMusic = lazy(() => import('./components/experiences/XianDrumMusic'))
const FengxiangClaySculpture = lazy(() => import('./components/experiences/FengxiangClaySculpture'))

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
          </Route>
          {/* 非遗知识地图 */}
          <Route path="/map" element={<HeritageMap />} />
          {/* 3D虚拟展厅 */}
          <Route path="/gallery" element={<VirtualGallery />} />
          {/* 非遗历史时间线 */}
          <Route path="/timeline" element={<HeritageTimeline />} />
          {/* 非遗互动体验路由 */}
          <Route path="/experience/bamboo-weaving" element={<BambooWeavingGame />} />
          <Route path="/experience/paper-cutting" element={<PaperCuttingGame />} />
          <Route path="/experience/hani-terrace" element={<HaniTerracePanorama />} />
          {/* 陕西非遗体验路由 */}
          <Route path="/experience/shadow-puppet" element={<ShadowPuppetShow />} />
          <Route path="/experience/qinqiang-mask" element={<QinqiangFaceMask />} />
          <Route path="/experience/ansai-drum" element={<AnsaiDrum />} />
          <Route path="/experience/xian-music" element={<XianDrumMusic />} />
          <Route path="/experience/fengxiang-clay" element={<FengxiangClaySculpture />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
