import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 导出生态相关 stores
export { useGreenPointsStore } from './greenPointsStore'
export { useCarbonAccountStore } from './carbonAccountStore'
export { useEcoAchievementStore } from './ecoAchievementStore'
export { usePolaroidStore, EXPERIENCE_TO_SCENE, SCENE_UNLOCK_CONDITIONS } from './polaroidStore'

// 体验进度状态
interface ExperienceState {
  completedExperiences: string[]
  collectedFragments: string[]
  completeExperience: (experienceId: string) => void
  collectFragment: (fragmentId: string) => void
  resetProgress: () => void
}

export const useExperienceStore = create<ExperienceState>()(
  persist(
    (set) => ({
      completedExperiences: [],
      collectedFragments: [],
      completeExperience: (experienceId) => set((state) => ({
        completedExperiences: state.completedExperiences.includes(experienceId)
          ? state.completedExperiences
          : [...state.completedExperiences, experienceId]
      })),
      collectFragment: (fragmentId) => set((state) => ({
        collectedFragments: state.collectedFragments.includes(fragmentId)
          ? state.collectedFragments
          : [...state.collectedFragments, fragmentId]
      })),
      resetProgress: () => set({ completedExperiences: [], collectedFragments: [] }),
    }),
    {
      name: 'experience-storage',
    }
  )
)

// UI状态
interface UIState {
  isMenuOpen: boolean
  activeModal: string | null
  isLoginModalOpen: boolean
  toggleMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  openLoginModal: () => void
  closeLoginModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  activeModal: null,
  isLoginModalOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}))

// 用户状态
interface User {
  id: string
  name: string
  nickname?: string
  avatar: string
  email: string
  level?: number
  experience?: number
  fragments?: string[]
  badges?: string[]
  orders?: string[]
}

interface UserState {
  user: User | null
  isLoggedIn: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isAuthenticated: false,
      login: (user) => set({ user, isLoggedIn: true, isAuthenticated: true }),
      logout: () => set({ user: null, isLoggedIn: false, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
    }
  )
)


