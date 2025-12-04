import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  toggleMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  activeModal: null,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}))
