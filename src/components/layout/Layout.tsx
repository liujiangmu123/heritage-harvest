import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AIChatAssistant from '@/components/AIChatAssistant'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* AI对话助手 - 全局悬浮 */}
      <AIChatAssistant />
    </div>
  )
}
