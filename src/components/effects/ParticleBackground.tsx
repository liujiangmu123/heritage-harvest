/**
 * 高级粒子背景效果组件
 * 使用 Canvas 创建流动的粒子效果
 */

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface ParticleBackgroundProps {
  particleCount?: number
  colors?: string[]
  speed?: number
  connectDistance?: number
  className?: string
}

export default function ParticleBackground({
  particleCount = 80,
  colors = ['#D97706', '#EA580C', '#DC2626', '#9333EA', '#2563EB'],
  speed = 0.5,
  connectDistance = 120,
  className = '',
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 200,
    }
  }, [colors, speed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 初始化粒子
    particlesRef.current = Array.from({ length: particleCount }, () => 
      createParticle(canvas)
    )

    // 鼠标交互
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 动画循环
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, i) => {
        // 更新位置
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // 鼠标吸引效果
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          particle.vx += dx * 0.00005
          particle.vy += dy * 0.00005
        }

        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // 重生
        if (particle.life > particle.maxLife) {
          particlesRef.current[i] = createParticle(canvas)
        }

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // 连接附近粒子
        particlesRef.current.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectDistance) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = particle.color + Math.floor((1 - distance / connectDistance) * 50).toString(16).padStart(2, '0')
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, createParticle, connectDistance])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ background: 'transparent' }}
    />
  )
}

// 流光效果组件
export function GlowOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 主光球 */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[100px] animate-float-slow"
        style={{
          background: 'radial-gradient(circle, #D97706 0%, transparent 70%)',
          top: '10%',
          left: '10%',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px] animate-float-slower"
        style={{
          background: 'radial-gradient(circle, #9333EA 0%, transparent 70%)',
          top: '50%',
          right: '5%',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-25 blur-[60px] animate-float"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
        }}
      />
      
      {/* 小光点 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/30 animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

// 网格背景
export function GridBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
}

// 渐变光束
export function LightBeams() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-[2px] h-[200vh] bg-gradient-to-b from-transparent via-heritage-500/20 to-transparent rotate-[30deg] animate-beam"
        style={{ left: '20%', top: '-50%' }}
      />
      <div 
        className="absolute w-[2px] h-[200vh] bg-gradient-to-b from-transparent via-primary-500/20 to-transparent rotate-[30deg] animate-beam-delayed"
        style={{ left: '50%', top: '-50%' }}
      />
      <div 
        className="absolute w-[2px] h-[200vh] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent rotate-[30deg] animate-beam"
        style={{ left: '80%', top: '-50%', animationDelay: '2s' }}
      />
    </div>
  )
}
