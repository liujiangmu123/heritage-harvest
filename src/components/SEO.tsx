/**
 * SEO 元数据组件
 * 
 * 用于设置页面标题、描述、关键词等 SEO 相关的 meta 标签
 * 使用 document.title 和 meta 标签直接操作 DOM
 */

import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

const DEFAULT_TITLE = '乡遗识 - 非遗数字体验平台'
const DEFAULT_DESCRIPTION = '运用 WebXR、Three.js、MediaPipe 等先进前端技术，将传统非遗工艺转化为可交互的数字体验，让文化遗产在指尖重获新生。'
const DEFAULT_KEYWORDS = ['非遗', '非物质文化遗产', '数字体验', '陕西非遗', '皮影戏', '秦腔', 'WebXR', 'Three.js']
const DEFAULT_IMAGE = '/og-image.png'

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
}: SEOProps) {
  const fullTitle = title ? `${title} | 乡遗识` : DEFAULT_TITLE

  useEffect(() => {
    // 设置页面标题
    document.title = fullTitle

    // 更新或创建 meta 标签
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    // 基础 meta 标签
    updateMeta('description', description)
    updateMeta('keywords', keywords.join(', '))

    // Open Graph 标签
    updateMeta('og:title', fullTitle, true)
    updateMeta('og:description', description, true)
    updateMeta('og:type', type, true)
    updateMeta('og:image', image, true)
    if (url) updateMeta('og:url', url, true)

    // Twitter Card 标签
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:title', fullTitle)
    updateMeta('twitter:description', description)
    updateMeta('twitter:image', image)

  }, [fullTitle, description, keywords, image, url, type])

  return null
}

/**
 * 预设的 SEO 配置
 */
export const SEO_PRESETS = {
  home: {
    title: undefined,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  shadowPuppet: {
    title: '华县皮影戏',
    description: '通过手势识别技术，亲手操控皮影人物，在光与影之间重演千年戏台故事。',
    keywords: ['皮影戏', '华县', '手势识别', '非遗体验', 'MediaPipe'],
  },
  qinqiangMask: {
    title: '秦腔脸谱',
    description: '使用 AR 技术实时上妆，体验秦腔脸谱的浓墨重彩，生旦净丑在你脸上轮番登场。',
    keywords: ['秦腔', '脸谱', 'AR', '人脸识别', '非遗体验'],
  },
  ansaiDrum: {
    title: '安塞腰鼓',
    description: '体感节奏游戏，跟随腰鼓的鼓点挥臂跃动，感受黄土高原的粗犷与热烈。',
    keywords: ['安塞腰鼓', '体感游戏', '节奏', '姿态识别', '非遗体验'],
  },
  xianDrumMusic: {
    title: '西安鼓乐',
    description: '虚拟演奏堂鼓、编钟、笙等古乐器，在律动的声浪中走进千年古乐宫阙。',
    keywords: ['西安鼓乐', '古乐', '音乐', 'Web Audio', '非遗体验'],
  },
  fengxiangClay: {
    title: '凤翔泥塑',
    description: '3D 虚拟捏塑体验，揉、按、掐、捏，塑出虎头瑞兽与吉祥童子。',
    keywords: ['凤翔泥塑', '3D建模', '泥塑', '非遗体验'],
  },
  gallery: {
    title: '3D虚拟展厅',
    description: '步入数字非遗博物馆，360°欣赏珍贵文化遗产。',
    keywords: ['虚拟展厅', '3D', '博物馆', 'WebGL'],
  },
  timeline: {
    title: '非遗时间线',
    description: '穿越历史长河，见证非遗从古至今的传承之路。',
    keywords: ['非遗历史', '时间线', '文化传承'],
  },
  map: {
    title: '非遗知识地图',
    description: '探索中国各地非物质文化遗产，发现文化宝藏。',
    keywords: ['非遗地图', '中国地图', '文化遗产分布'],
  },
}

export default SEO
