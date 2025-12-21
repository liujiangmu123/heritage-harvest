/**
 * 拍立得状态管理
 * 统一管理拍立得相关状态，支持深度融入整个应用流程
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EcoScene, PolaroidResult } from '@/types/eco'

interface PolaroidState {
  // 已生成的拍立得集合
  polaroids: PolaroidResult[]
  // 当前选中的场景
  currentScene: EcoScene
  // 是否显示拍立得弹窗
  showPolaroidModal: boolean
  // 触发来源（用于分析和个性化提示）
  triggerSource: 'experience_complete' | 'floating_button' | 'achievement' | 'manual' | null
  // 待解锁的拍立得场景
  unlockedScenes: EcoScene[]
  // 每日拍照次数
  dailyPhotoCount: number
  // 上次拍照日期
  lastPhotoDate: string | null
  
  // Actions
  addPolaroid: (polaroid: PolaroidResult) => void
  removePolaroid: (id: string) => void
  setCurrentScene: (scene: EcoScene) => void
  openPolaroidModal: (source: PolaroidState['triggerSource'], scene?: EcoScene) => void
  closePolaroidModal: () => void
  unlockScene: (scene: EcoScene) => void
  incrementDailyCount: () => void
  resetDailyCount: () => void
  
  // 计算属性辅助方法
  getTotalCarbonSaved: () => number
  getPolaroidsByScene: (scene: EcoScene) => PolaroidResult[]
}

// 场景与体验ID的映射
export const EXPERIENCE_TO_SCENE: Record<string, EcoScene> = {
  'hani-terrace': 'hani_terrace',
  'hani_terrace': 'hani_terrace',
  'bamboo-weaving': 'bamboo_forest',
  'bamboo_weaving': 'bamboo_forest',
  'tea-ceremony': 'tea_garden',
  'tea_ceremony': 'tea_garden',
  'paper-cutting': 'paper_cutting',
  'paper_cutting': 'paper_cutting',
  'fengxiang-clay': 'clay_studio',
  'fengxiang_clay': 'clay_studio',
  'batik': 'batik_workshop',
  'shadow-puppet': 'paper_cutting', // 皮影戏映射到剪纸工坊（都是纸艺相关）
}

// 场景解锁条件描述
export const SCENE_UNLOCK_CONDITIONS: Record<EcoScene, string> = {
  hani_terrace: '完成哈尼梯田体验解锁',
  tea_garden: '完成茶道生态体验解锁',
  bamboo_forest: '完成藤编工艺体验解锁',
  batik_workshop: '完成蜡染体验解锁',
  paper_cutting: '完成剪纸艺术体验解锁',
  clay_studio: '完成凤翔泥塑体验解锁',
}

export const usePolaroidStore = create<PolaroidState>()(
  persist(
    (set, get) => ({
      polaroids: [],
      currentScene: 'hani_terrace',
      showPolaroidModal: false,
      triggerSource: null,
      unlockedScenes: ['hani_terrace'], // 默认解锁哈尼梯田
      dailyPhotoCount: 0,
      lastPhotoDate: null,

      addPolaroid: (polaroid) => set((state) => {
        const today = new Date().toDateString()
        const isNewDay = state.lastPhotoDate !== today
        
        return {
          polaroids: [...state.polaroids, polaroid],
          dailyPhotoCount: isNewDay ? 1 : state.dailyPhotoCount + 1,
          lastPhotoDate: today,
        }
      }),

      removePolaroid: (id) => set((state) => ({
        polaroids: state.polaroids.filter(p => p.id !== id)
      })),

      setCurrentScene: (scene) => set({ currentScene: scene }),

      openPolaroidModal: (source, scene) => set((state) => ({
        showPolaroidModal: true,
        triggerSource: source,
        currentScene: scene || state.currentScene,
      })),

      closePolaroidModal: () => set({
        showPolaroidModal: false,
        triggerSource: null,
      }),

      unlockScene: (scene) => set((state) => ({
        unlockedScenes: state.unlockedScenes.includes(scene)
          ? state.unlockedScenes
          : [...state.unlockedScenes, scene]
      })),

      incrementDailyCount: () => set((state) => {
        const today = new Date().toDateString()
        const isNewDay = state.lastPhotoDate !== today
        
        return {
          dailyPhotoCount: isNewDay ? 1 : state.dailyPhotoCount + 1,
          lastPhotoDate: today,
        }
      }),

      resetDailyCount: () => set({
        dailyPhotoCount: 0,
        lastPhotoDate: null,
      }),

      getTotalCarbonSaved: () => {
        return get().polaroids.reduce((total, p) => total + p.carbonSaved, 0)
      },

      getPolaroidsByScene: (scene) => {
        return get().polaroids.filter(p => p.scene === scene)
      },
    }),
    {
      name: 'polaroid-storage',
    }
  )
)
