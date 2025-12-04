/**
 * 音频和语音控制面板组件
 * 集成音频系统和语音导览功能
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  Play,
  Pause,
  SkipForward,
  Settings,
  X,
  Music,
  MessageSquare,
  Headphones
} from 'lucide-react'
import { useAudio, AUDIO_PRESETS } from '@/hooks/useAudio'
import { useSpeech, NARRATION_PRESETS, type NarrationContent } from '@/hooks/useSpeech'

interface AudioControlsProps {
  experienceId?: string
  showNarration?: boolean
  className?: string
}

export default function AudioControls({ 
  experienceId, 
  showNarration = true,
  className = '' 
}: AudioControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'audio' | 'narration'>('audio')
  const [currentBgm, setCurrentBgm] = useState<string | null>(null)
  const [currentAmbient, setCurrentAmbient] = useState<string | null>(null)

  const { 
    isMuted, 
    masterVolume, 
    initAudio,
    playPreset, 
    stopAllAudio, 
    setVolume, 
    toggleMute 
  } = useAudio()

  const {
    isSupported: speechSupported,
    isSpeaking,
    isPaused,
    currentNarration,
    playNarrationPreset,
    pause,
    resume,
    stop,
    getChineseVoices,
  } = useSpeech()

  // 获取当前体验的导览内容
  const narrations = experienceId ? NARRATION_PRESETS[experienceId] : []

  // 播放背景音乐
  const handlePlayBgm = async (name: string) => {
    await initAudio()
    if (currentBgm) {
      stopAllAudio()
    }
    const id = await playPreset('bgm', name)
    setCurrentBgm(id ? name : null)
  }

  // 播放环境音
  const handlePlayAmbient = async (name: string) => {
    await initAudio()
    const id = await playPreset('ambient', name, { volume: 0.5 })
    setCurrentAmbient(id ? name : null)
  }

  // 播放导览
  const handlePlayNarration = (narration: NarrationContent) => {
    playNarrationPreset(experienceId!, narration.id)
  }

  return (
    <div className={`fixed bottom-4 left-4 z-40 ${className}`}>
      {/* 主按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-12 h-12 rounded-full shadow-lg flex items-center justify-center
          ${isExpanded 
            ? 'bg-heritage-500 text-white' 
            : 'bg-white/90 text-ink-700 hover:bg-white'
          }
        `}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
      </motion.button>

      {/* 快捷静音按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMute}
        className="absolute left-14 bottom-0 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-ink-700 hover:bg-white"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </motion.button>

      {/* 展开面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-72 bg-ink-900/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 标签页 */}
            <div className="flex border-b border-ink-700">
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${activeTab === 'audio' ? 'text-heritage-400 border-b-2 border-heritage-400' : 'text-ink-400'}`}
              >
                <Music className="w-4 h-4" />
                音频
              </button>
              {showNarration && (
                <button
                  onClick={() => setActiveTab('narration')}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${activeTab === 'narration' ? 'text-heritage-400 border-b-2 border-heritage-400' : 'text-ink-400'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  语音导览
                </button>
              )}
            </div>

            {/* 音频控制 */}
            {activeTab === 'audio' && (
              <div className="p-4 space-y-4">
                {/* 主音量 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-ink-300">主音量</span>
                    <span className="text-xs text-ink-500">{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-ink-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-heritage-500"
                  />
                </div>

                {/* 背景音乐 */}
                <div>
                  <h4 className="text-sm text-ink-300 mb-2">背景音乐</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(AUDIO_PRESETS.bgm).map((name) => (
                      <button
                        key={name}
                        onClick={() => handlePlayBgm(name)}
                        className={`
                          px-3 py-2 text-xs rounded-lg transition-all
                          ${currentBgm === name
                            ? 'bg-heritage-500 text-white'
                            : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                          }
                        `}
                      >
                        {name === 'traditional' && '传统'}
                        {name === 'peaceful' && '宁静'}
                        {name === 'folk' && '民俗'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 环境音 */}
                <div>
                  <h4 className="text-sm text-ink-300 mb-2">环境音效</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(AUDIO_PRESETS.ambient).map((name) => (
                      <button
                        key={name}
                        onClick={() => handlePlayAmbient(name)}
                        className={`
                          px-3 py-2 text-xs rounded-lg transition-all
                          ${currentAmbient === name
                            ? 'bg-primary-500 text-white'
                            : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                          }
                        `}
                      >
                        {name === 'nature' && '🌳 自然'}
                        {name === 'water' && '💧 流水'}
                        {name === 'wind' && '🍃 风声'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 停止按钮 */}
                <button
                  onClick={() => {
                    stopAllAudio()
                    setCurrentBgm(null)
                    setCurrentAmbient(null)
                  }}
                  className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                >
                  停止所有音频
                </button>
              </div>
            )}

            {/* 语音导览 */}
            {activeTab === 'narration' && (
              <div className="p-4 space-y-4">
                {!speechSupported ? (
                  <div className="text-center py-4 text-ink-400 text-sm">
                    当前浏览器不支持语音合成
                  </div>
                ) : (
                  <>
                    {/* 当前播放状态 */}
                    {currentNarration && (
                      <div className="bg-heritage-500/20 rounded-xl p-3">
                        <div className="text-xs text-heritage-400 mb-1">正在播放</div>
                        <div className="text-white font-medium text-sm">
                          {currentNarration.title}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={isPaused ? resume : pause}
                            className="p-2 bg-heritage-500 rounded-full text-white"
                          >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={stop}
                            className="p-2 bg-ink-700 rounded-full text-ink-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 导览列表 */}
                    {narrations.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm text-ink-300">选择导览内容</h4>
                        {narrations.map((narration) => (
                          <button
                            key={narration.id}
                            onClick={() => handlePlayNarration(narration)}
                            disabled={isSpeaking && currentNarration?.id === narration.id}
                            className={`
                              w-full text-left p-3 rounded-lg transition-all
                              ${currentNarration?.id === narration.id
                                ? 'bg-heritage-500/30 border border-heritage-500'
                                : 'bg-ink-700 hover:bg-ink-600'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-sm">{narration.title}</span>
                              {narration.duration && (
                                <span className="text-xs text-ink-400">
                                  {narration.duration}秒
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-ink-400 text-sm">
                        当前体验暂无语音导览
                      </div>
                    )}

                    {/* 播放全部 */}
                    {narrations.length > 0 && !isSpeaking && (
                      <button
                        onClick={() => playNarrationPreset(experienceId!)}
                        className="w-full py-2 bg-heritage-500 text-white rounded-lg text-sm hover:bg-heritage-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        播放全部导览
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 迷你音频指示器（用于体验页面角落）
export function AudioIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={isPlaying ? {
            height: [4, 12, 4],
          } : { height: 4 }}
          transition={{
            duration: 0.5,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.1,
          }}
          className="w-1 bg-heritage-500 rounded-full"
          style={{ height: 4 }}
        />
      ))}
    </div>
  )
}
