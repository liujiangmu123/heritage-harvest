/**
 * 作品集状态管理
 * 保存用户的编织作品、拍立得照片等创作内容
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 编织作品类型
export interface WeavingArtwork {
  id: string
  type: 'weaving'
  image: string              // base64图片数据
  title: string              // 作品称号（编织DNA生成）
  craftLevel: string         // 工艺等级
  productStyle: string       // 成品样式
  colorScheme?: {
    primary: string
    secondary: string
    accent: string
    highlight: string
  }
  smoothness: number         // 平滑度
  creativity: number         // 创意度
  persistence: number        // 坚持度
  carbonSaved: number        // 碳减排量
  pointsEarned: number       // 获得积分
  createdAt: string          // 创建时间
  seed: number               // 设计种子
}

// 拍立得作品类型
export interface PolaroidArtwork {
  id: string
  type: 'polaroid'
  image: string              // base64图片数据
  scene: string              // 场景ID
  sceneName: string          // 场景名称
  ecoMessage: string         // 环保寄语
  carbonSaved: number        // 碳减排量
  pointsEarned: number       // 获得积分
  createdAt: string          // 创建时间
  sourceWeaving?: string     // 关联的编织作品ID（如果有）
}

// 统一作品类型
export type Artwork = WeavingArtwork | PolaroidArtwork

interface ArtworkState {
  // 所有作品
  artworks: Artwork[]
  
  // Actions
  addWeavingArtwork: (artwork: Omit<WeavingArtwork, 'id' | 'type' | 'createdAt'>) => string
  addPolaroidArtwork: (artwork: Omit<PolaroidArtwork, 'id' | 'type' | 'createdAt'>) => string
  removeArtwork: (id: string) => void
  clearAllArtworks: () => void
  
  // 查询方法
  getWeavingArtworks: () => WeavingArtwork[]
  getPolaroidArtworks: () => PolaroidArtwork[]
  getArtworkById: (id: string) => Artwork | undefined
  getLatestWeaving: () => WeavingArtwork | undefined
  getTotalCarbonSaved: () => number
  getTotalPointsEarned: () => number
}

// 生成唯一ID
const generateId = () => `artwork_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useArtworkStore = create<ArtworkState>()(
  persist(
    (set, get) => ({
      artworks: [],

      addWeavingArtwork: (artwork) => {
        const id = generateId()
        const newArtwork: WeavingArtwork = {
          ...artwork,
          id,
          type: 'weaving',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          artworks: [newArtwork, ...state.artworks] // 新作品放在最前面
        }))
        return id
      },

      addPolaroidArtwork: (artwork) => {
        const id = generateId()
        const newArtwork: PolaroidArtwork = {
          ...artwork,
          id,
          type: 'polaroid',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          artworks: [newArtwork, ...state.artworks]
        }))
        return id
      },

      removeArtwork: (id) => set((state) => ({
        artworks: state.artworks.filter(a => a.id !== id)
      })),

      clearAllArtworks: () => set({ artworks: [] }),

      getWeavingArtworks: () => {
        return get().artworks.filter((a): a is WeavingArtwork => a.type === 'weaving')
      },

      getPolaroidArtworks: () => {
        return get().artworks.filter((a): a is PolaroidArtwork => a.type === 'polaroid')
      },

      getArtworkById: (id) => {
        return get().artworks.find(a => a.id === id)
      },

      getLatestWeaving: () => {
        return get().artworks.find((a): a is WeavingArtwork => a.type === 'weaving')
      },

      getTotalCarbonSaved: () => {
        return get().artworks.reduce((total, a) => total + a.carbonSaved, 0)
      },

      getTotalPointsEarned: () => {
        return get().artworks.reduce((total, a) => total + a.pointsEarned, 0)
      },
    }),
    {
      name: 'artwork-storage',
    }
  )
)
