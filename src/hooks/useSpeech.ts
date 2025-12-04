/**
 * AI语音导览系统 Hook
 * 使用 Web Speech API 实现语音合成和语音识别
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// 语音配置
interface SpeechConfig {
  lang?: string
  rate?: number  // 语速 0.1-10
  pitch?: number // 音调 0-2
  volume?: number // 音量 0-1
  voice?: SpeechSynthesisVoice | null
}

// 导览内容类型
export interface NarrationContent {
  id: string
  title: string
  text: string
  duration?: number // 预估时长(秒)
}

// 预设导览内容
export const NARRATION_PRESETS: Record<string, NarrationContent[]> = {
  'bamboo-weaving': [
    {
      id: 'intro',
      title: '安溪藤铁工艺简介',
      text: '欢迎来到安溪藤铁工艺体验。安溪藤铁工艺是福建省安溪县的传统手工艺，已有数百年历史。它将藤条与铁丝巧妙结合，编织出各种精美的工艺品。',
      duration: 15,
    },
    {
      id: 'technique',
      title: '编织技法',
      text: '藤铁编织的核心在于手法的协调。请尝试握拳开始编织，张开手掌暂停。您的每一次编织动作，都在重现传承人数十年的技艺精华。',
      duration: 12,
    },
    {
      id: 'history',
      title: '历史传承',
      text: '安溪藤铁工艺于2014年被列入国家级非物质文化遗产名录。如今，这项技艺不仅传承了传统美学，更融入了现代设计理念。',
      duration: 10,
    },
  ],
  'paper-cutting': [
    {
      id: 'intro',
      title: '剪纸艺术简介',
      text: '欢迎体验中国剪纸艺术。剪纸是中国最古老的民间艺术之一，已有一千五百多年的历史。2009年被联合国教科文组织列入人类非物质文化遗产代表作名录。',
      duration: 15,
    },
    {
      id: 'symbolism',
      title: '图案寓意',
      text: '剪纸的图案蕴含丰富的吉祥寓意。例如，双喜代表婚庆，蝴蝶象征爱情，鱼寓意年年有余。每一刀都承载着人们对美好生活的向往。',
      duration: 12,
    },
  ],
  'hani-terrace': [
    {
      id: 'intro',
      title: '哈尼梯田简介',
      text: '您正在欣赏的是云南红河哈尼梯田，这是哈尼族人民一千三百多年农耕智慧的结晶。2013年被列入世界文化遗产名录。',
      duration: 12,
    },
    {
      id: 'ecosystem',
      title: '生态系统',
      text: '哈尼梯田形成了独特的"森林-村寨-梯田-水系"四素同构的生态系统。山顶森林涵养水源，村寨建在半山腰，梯田层层向下，形成了人与自然和谐共生的典范。',
      duration: 15,
    },
    {
      id: 'culture',
      title: '长街宴文化',
      text: '每年农历十月，哈尼族会举办盛大的长街宴，家家户户摆出美食，共庆丰收。这是国家级非物质文化遗产，体现了哈尼族的团结与感恩。',
      duration: 12,
    },
  ],
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [currentNarration, setCurrentNarration] = useState<NarrationContent | null>(null)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const queueRef = useRef<NarrationContent[]>([])

  // 检查浏览器支持
  useEffect(() => {
    const supported = 'speechSynthesis' in window
    setIsSupported(supported)

    if (supported) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // 优先选择中文语音
        const chineseVoice = availableVoices.find(
          v => v.lang.includes('zh') || v.lang.includes('cmn')
        )
        if (chineseVoice) {
          setCurrentVoice(chineseVoice)
        }
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // 朗读文本
  const speak = useCallback((text: string, config: SpeechConfig = {}) => {
    if (!isSupported) return

    // 停止当前朗读
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = config.lang || 'zh-CN'
    utterance.rate = config.rate || 1
    utterance.pitch = config.pitch || 1
    utterance.volume = config.volume || 1
    
    if (config.voice || currentVoice) {
      utterance.voice = config.voice || currentVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentNarration(null)
      
      // 播放队列中的下一个
      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift()
        if (next) {
          speakNarration(next)
        }
      }
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [isSupported, currentVoice])

  // 朗读导览内容
  const speakNarration = useCallback((narration: NarrationContent, config?: SpeechConfig) => {
    setCurrentNarration(narration)
    speak(narration.text, config)
  }, [speak])

  // 播放预设导览
  const playNarrationPreset = useCallback((
    experienceId: string,
    narrationId?: string,
    config?: SpeechConfig
  ) => {
    const narrations = NARRATION_PRESETS[experienceId]
    if (!narrations) return

    if (narrationId) {
      const narration = narrations.find(n => n.id === narrationId)
      if (narration) {
        speakNarration(narration, config)
      }
    } else {
      // 播放全部（加入队列）
      queueRef.current = [...narrations.slice(1)]
      if (narrations[0]) {
        speakNarration(narrations[0], config)
      }
    }
  }, [speakNarration])

  // 暂停
  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSpeaking, isPaused])

  // 继续
  const resume = useCallback(() => {
    if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isPaused])

  // 停止
  const stop = useCallback(() => {
    speechSynthesis.cancel()
    queueRef.current = []
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentNarration(null)
  }, [])

  // 切换语音
  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  // 获取中文语音列表
  const getChineseVoices = useCallback(() => {
    return voices.filter(v => 
      v.lang.includes('zh') || 
      v.lang.includes('cmn') ||
      v.name.includes('Chinese') ||
      v.name.includes('中文')
    )
  }, [voices])

  // 清理
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    currentVoice,
    currentNarration,
    speak,
    speakNarration,
    playNarrationPreset,
    pause,
    resume,
    stop,
    selectVoice,
    getChineseVoices,
  }
}

// ==================== 语音识别 Hook ====================

interface VoiceCommand {
  command: string[]  // 可触发的关键词
  action: () => void
  description: string
}

export function useVoiceRecognition(commands: VoiceCommand[] = []) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN'

      recognition.onresult = (event: any) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript.toLowerCase()
        setTranscript(text)

        if (result.isFinal) {
          // 匹配命令
          for (const cmd of commands) {
            if (cmd.command.some(c => text.includes(c.toLowerCase()))) {
              cmd.action()
              break
            }
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [commands])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  }
}
