/**
 * 沉浸式音频系统 Hook
 * 使用 Web Audio API 实现3D空间音频和环境音效
 */

import { useRef, useCallback, useEffect, useState } from 'react'

// 音频配置类型
interface AudioConfig {
  volume?: number
  loop?: boolean
  spatial?: boolean // 是否启用3D空间音频
  position?: { x: number; y: number; z: number }
}

// 音频源类型
type AudioSourceType = 'bgm' | 'ambient' | 'effect'

// 预设音效URLs (使用免费音效)
export const AUDIO_PRESETS = {
  // 背景音乐
  bgm: {
    traditional: 'https://assets.mixkit.co/music/preview/mixkit-traditional-chinese-618.mp3',
    peaceful: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    folk: 'https://assets.mixkit.co/music/preview/mixkit-chinese-celebration-617.mp3',
  },
  // 环境音
  ambient: {
    nature: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
    water: 'https://assets.mixkit.co/sfx/preview/mixkit-river-stream-nature-1189.mp3',
    wind: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-trees-1232.mp3',
  },
  // 交互音效
  effect: {
    click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
    weaving: 'https://assets.mixkit.co/sfx/preview/mixkit-paper-slide-1530.mp3',
    cutting: 'https://assets.mixkit.co/sfx/preview/mixkit-scissor-cutting-paper-1549.mp3',
  },
}

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [masterVolume, setMasterVolume] = useState(0.7)

  // 初始化音频上下文
  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = masterVolume
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }, [masterVolume])

  // 加载音频文件
  const loadAudio = useCallback(async (url: string, id: string): Promise<AudioBuffer | null> => {
    if (!audioContextRef.current) await initAudio()
    if (!audioContextRef.current) return null

    // 检查缓存
    if (audioBuffersRef.current.has(id)) {
      return audioBuffersRef.current.get(id)!
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
      audioBuffersRef.current.set(id, audioBuffer)
      return audioBuffer
    } catch (error) {
      console.error(`Failed to load audio: ${url}`, error)
      return null
    }
  }, [initAudio])

  // 播放音频
  const playAudio = useCallback(async (
    urlOrId: string,
    config: AudioConfig = {}
  ): Promise<string | null> => {
    if (!audioContextRef.current) await initAudio()
    if (!audioContextRef.current || !gainNodeRef.current) return null

    const { volume = 1, loop = false, spatial = false, position } = config
    const id = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // 尝试从预设或URL加载
      let buffer = audioBuffersRef.current.get(urlOrId)
      if (!buffer) {
        buffer = await loadAudio(urlOrId, urlOrId)
      }
      if (!buffer) return null

      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.loop = loop

      // 创建音量节点
      const volumeNode = audioContextRef.current.createGain()
      volumeNode.gain.value = isMuted ? 0 : volume

      if (spatial && position) {
        // 3D空间音频
        const panner = audioContextRef.current.createPanner()
        panner.panningModel = 'HRTF'
        panner.distanceModel = 'inverse'
        panner.refDistance = 1
        panner.maxDistance = 100
        panner.rolloffFactor = 1
        panner.setPosition(position.x, position.y, position.z)
        
        source.connect(volumeNode)
        volumeNode.connect(panner)
        panner.connect(gainNodeRef.current)
      } else {
        source.connect(volumeNode)
        volumeNode.connect(gainNodeRef.current)
      }

      source.start()
      activeSourcesRef.current.set(id, source)

      source.onended = () => {
        activeSourcesRef.current.delete(id)
      }

      return id
    } catch (error) {
      console.error('Failed to play audio:', error)
      return null
    }
  }, [initAudio, loadAudio, isMuted])

  // 停止指定音频
  const stopAudio = useCallback((id: string) => {
    const source = activeSourcesRef.current.get(id)
    if (source) {
      try {
        source.stop()
        activeSourcesRef.current.delete(id)
      } catch (e) {
        // 忽略已停止的音频
      }
    }
  }, [])

  // 停止所有音频
  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach((source, id) => {
      try {
        source.stop()
      } catch (e) {
        // 忽略
      }
    })
    activeSourcesRef.current.clear()
  }, [])

  // 设置主音量
  const setVolume = useCallback((volume: number) => {
    setMasterVolume(volume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume
    }
  }, [isMuted])

  // 切换静音
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newMuted ? 0 : masterVolume
      }
      return newMuted
    })
  }, [masterVolume])

  // 播放预设音效
  const playPreset = useCallback(async (
    type: AudioSourceType,
    name: string,
    config?: AudioConfig
  ) => {
    const presets = AUDIO_PRESETS[type] as Record<string, string>
    const url = presets?.[name]
    if (url) {
      return playAudio(url, { ...config, loop: type === 'bgm' || type === 'ambient' })
    }
    return null
  }, [playAudio])

  // 清理
  useEffect(() => {
    return () => {
      stopAllAudio()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stopAllAudio])

  return {
    isInitialized,
    isMuted,
    masterVolume,
    initAudio,
    loadAudio,
    playAudio,
    playPreset,
    stopAudio,
    stopAllAudio,
    setVolume,
    toggleMute,
  }
}

// 音频管理器上下文 (用于全局音频状态)
import { createContext, useContext } from 'react'

interface AudioContextType extends ReturnType<typeof useAudio> {}

export const AudioContext = createContext<AudioContextType | null>(null)

export function useAudioContext() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider')
  }
  return context
}
