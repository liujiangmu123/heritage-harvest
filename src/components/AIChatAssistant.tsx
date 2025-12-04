/**
 * AI对话助手组件
 * 智能问答非遗知识
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb
} from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

// 预设问答知识库
const KNOWLEDGE_BASE = [
  {
    keywords: ['藤铁', '安溪', '编织'],
    answer: '安溪藤铁工艺是福建省安溪县的传统手工艺，已有数百年历史。它将天然藤条与铁丝巧妙结合，通过编、织、缠、绕等技法，制作出各种精美的工艺品和家居用品。2014年被列入国家级非物质文化遗产名录。这项技艺不仅体现了劳动人民的智慧，更融合了实用与美观的设计理念。',
  },
  {
    keywords: ['剪纸', '历史', '起源'],
    answer: '中国剪纸艺术有着1500多年的悠久历史，起源于汉代，兴盛于唐宋。它是中国最古老的民间艺术之一，以纸为材料，通过剪、刻等技法创作出各种图案。2009年被联合国教科文组织列入人类非物质文化遗产代表作名录。剪纸图案蕴含丰富的吉祥寓意，如双喜、蝴蝶、鱼等，表达人们对美好生活的向往。',
  },
  {
    keywords: ['哈尼', '梯田', '云南'],
    answer: '哈尼梯田位于云南省红河哈尼族彝族自治州，是哈尼族人民1300多年农耕智慧的结晶。它形成了独特的"森林-村寨-梯田-水系"四素同构生态系统，被誉为人与自然和谐共生的典范。2013年被列入世界文化遗产名录。每年农历十月的长街宴是哈尼族最盛大的节日，体现了民族团结与感恩文化。',
  },
  {
    keywords: ['非遗', '非物质文化遗产', '什么是'],
    answer: '非物质文化遗产是指各族人民世代相传并视为其文化遗产组成部分的各种传统文化表现形式，包括传统口头文学、传统表演艺术、传统手工技艺、传统节庆民俗等。中国是非遗大国，拥有43项世界级非遗，1557项国家级非遗。保护和传承非遗对于维护文化多样性、促进文化创新具有重要意义。',
  },
  {
    keywords: ['苏绣', '刺绣', '四大名绣'],
    answer: '中国四大名绣包括苏绣、湘绣、粤绣、蜀绣。苏绣以精细雅洁著称，讲究"平、齐、细、密、和、光、顺、匀"八字诀；湘绣以写实著称，尤擅狮虎动物；粤绣色彩浓艳，立体感强；蜀绣针法严谨，色彩明快。这四大名绣各具特色，都是国家级非物质文化遗产。',
  },
  {
    keywords: ['京剧', '国粹', '戏曲'],
    answer: '京剧被誉为中国"国粹"，形成于北京，是中国最具影响力的戏曲剧种。它融合了唱、念、做、打四种表演方式，以生、旦、净、丑四大行当划分角色类型。京剧脸谱是其重要特色，不同颜色代表不同性格。2010年被列入世界非遗名录。代表剧目有《霸王别姬》《贵妃醉酒》《空城计》等。',
  },
  {
    keywords: ['传承人', '保护', '传承'],
    answer: '非遗传承人是非物质文化遗产的重要承载者和传递者。国家实施代表性传承人认定制度，给予政策扶持和经费补助。目前我国已认定五批国家级非遗代表性传承人3000余人。传承保护工作包括：建立数字档案、开展传习培训、推动活态传承、促进创新发展等。青年一代的参与对非遗传承尤为重要。',
  },
  {
    keywords: ['你好', '在吗', '嗨'],
    answer: '你好！我是非遗知识助手，很高兴为你服务。我可以回答关于中国非物质文化遗产的各种问题，包括传统技艺、民俗文化、历史渊源等。你可以问我关于藤铁工艺、剪纸艺术、哈尼梯田等内容，或者询问其他感兴趣的非遗项目。',
  },
]

// 推荐问题
const SUGGESTED_QUESTIONS = [
  '什么是非物质文化遗产？',
  '安溪藤铁工艺有什么特点？',
  '中国剪纸艺术的历史？',
  '哈尼梯田为什么是世界遗产？',
  '中国四大名绣是什么？',
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是非遗知识助手 ✨ 有任何关于非物质文化遗产的问题都可以问我哦~',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak, isSpeaking, stop } = useSpeech()

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 查找答案
  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(keyword => lowerQuestion.includes(keyword.toLowerCase()))) {
        return item.answer
      }
    }
    
    return '这个问题很有意思！虽然我目前的知识库还没有完全覆盖到这个话题，但我建议你可以通过我们的非遗地图和互动体验来探索更多内容。如果你想了解安溪藤铁工艺、剪纸艺术或哈尼梯田，我可以提供详细介绍哦~'
  }

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // 模拟思考延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const answer = findAnswer(input)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  // 语音朗读
  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text)
    }
  }

  // 使用推荐问题
  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          bg-gradient-to-r from-heritage-500 to-primary-500
          flex items-center justify-center text-white
          hover:shadow-heritage-500/50 transition-shadow
          ${isOpen ? 'hidden' : ''}
        `}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>

      {/* 对话窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-ink-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-heritage-500 to-primary-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">非遗知识助手</h3>
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      在线
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${message.role === 'user' 
                      ? 'bg-primary-500' 
                      : 'bg-gradient-to-br from-heritage-400 to-primary-500'
                    }
                  `}>
                    {message.role === 'user' 
                      ? <User className="w-4 h-4 text-white" />
                      : <Sparkles className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`
                    max-w-[75%] p-3 rounded-2xl
                    ${message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-ink-800 text-white rounded-bl-sm'
                    }
                  `}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* 助手消息操作 */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleSpeak(message.content)}
                          className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* 正在输入 */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-heritage-400 to-primary-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-ink-800 p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 推荐问题 */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1 text-xs text-ink-400 mb-2">
                  <Lightbulb className="w-3 h-3" />
                  试试这些问题
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestedQuestion(q)}
                      className="px-3 py-1 bg-ink-800 hover:bg-ink-700 text-ink-300 text-xs rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="p-4 border-t border-ink-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="输入你的问题..."
                  className="flex-1 bg-ink-800 border border-ink-700 rounded-xl px-4 py-2 text-white text-sm placeholder:text-ink-500 focus:outline-none focus:border-heritage-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-heritage-500 hover:bg-heritage-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
