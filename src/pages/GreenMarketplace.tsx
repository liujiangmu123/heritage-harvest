import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 根据 V2 优化需求，GreenMarketplace 重定向到创意画廊
// 电商功能已移除，聚焦于科普体验
export default function GreenMarketplace() {
  const navigate = useNavigate()

  useEffect(() => {
    // 重定向到创意画廊
    navigate('/creative-gallery', { replace: true })
  }, [navigate])

  return null
}
