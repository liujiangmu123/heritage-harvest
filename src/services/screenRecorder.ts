// 乡遗识 - 屏幕录制服务
// 支持录制演示过程并导出视频

/**
 * 录制状态枚举
 */
export const RECORDING_STATUS = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const

export type RecordingStatus = typeof RECORDING_STATUS[keyof typeof RECORDING_STATUS]

/**
 * 视频质量预设
 */
export const VIDEO_QUALITY = {
  LOW: { videoBitsPerSecond: 1000000, width: 1280, height: 720 },      // 720p
  MEDIUM: { videoBitsPerSecond: 2500000, width: 1920, height: 1080 },  // 1080p
  HIGH: { videoBitsPerSecond: 5000000, width: 1920, height: 1080 },    // 1080p 高码率
  ULTRA: { videoBitsPerSecond: 8000000, width: 2560, height: 1440 },   // 2K (1440p)
  FOUR_K: { videoBitsPerSecond: 15000000, width: 3840, height: 2160 }, // 4K
} as const

export type VideoQuality = typeof VIDEO_QUALITY[keyof typeof VIDEO_QUALITY]

interface RecorderOptions {
  quality?: VideoQuality
  mimeType?: string
  audioBitsPerSecond?: number
}

/**
 * 创建屏幕录制器
 */
export function createScreenRecorder(options: RecorderOptions = {}) {
  const {
    quality = VIDEO_QUALITY.MEDIUM,
    audioBitsPerSecond = 128000,
  } = options

  let mediaRecorder: MediaRecorder | null = null
  let recordedChunks: Blob[] = []
  let stream: MediaStream | null = null
  let status: RecordingStatus = RECORDING_STATUS.IDLE
  let startTime: number | null = null
  let duration = 0
  let onStatusChange: ((status: RecordingStatus) => void) | null = null
  let onError: ((error: Error) => void) | null = null
  let timerInterval: ReturnType<typeof setInterval> | null = null

  const recorder = {
    get status() { return status },
    get duration() { return duration },
    get isRecording() { return status === RECORDING_STATUS.RECORDING },
    get isPaused() { return status === RECORDING_STATUS.PAUSED },

    setOnStatusChange(callback: typeof onStatusChange) {
      onStatusChange = callback
    },

    setOnError(callback: typeof onError) {
      onError = callback
    },

    _updateStatus(newStatus: RecordingStatus) {
      status = newStatus
      if (onStatusChange) {
        onStatusChange(status)
      }
    },

    isSupported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
    },

    _getSupportedMimeType(): string {
      const types = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ]
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          return type
        }
      }
      return 'video/webm'
    },

    async start(): Promise<boolean> {
      if (!this.isSupported()) {
        this._updateStatus(RECORDING_STATUS.ERROR)
        if (onError) onError(new Error('浏览器不支持屏幕录制'))
        return false
      }

      try {
        this._updateStatus(RECORDING_STATUS.PREPARING)
        recordedChunks = []

        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: quality.width },
            height: { ideal: quality.height },
            frameRate: { ideal: 30 },
          },
          audio: true,
        })

        const supportedMimeType = this._getSupportedMimeType()
        
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: quality.videoBitsPerSecond,
          audioBitsPerSecond,
        })

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          this._updateStatus(RECORDING_STATUS.COMPLETED)
        }

        mediaRecorder.onerror = () => {
          this._updateStatus(RECORDING_STATUS.ERROR)
        }

        stream.getVideoTracks()[0].onended = () => {
          this.stop()
        }

        mediaRecorder.start(1000)
        startTime = Date.now()
        this._updateStatus(RECORDING_STATUS.RECORDING)
        
        timerInterval = setInterval(() => {
          if (status === RECORDING_STATUS.RECORDING && startTime) {
            duration = Math.floor((Date.now() - startTime) / 1000)
          }
        }, 1000)
        
        return true
      } catch (error) {
        this._updateStatus(RECORDING_STATUS.ERROR)
        if (onError) onError(error as Error)
        return false
      }
    },

    pause() {
      if (mediaRecorder && status === RECORDING_STATUS.RECORDING) {
        mediaRecorder.pause()
        this._updateStatus(RECORDING_STATUS.PAUSED)
      }
    },

    resume() {
      if (mediaRecorder && status === RECORDING_STATUS.PAUSED) {
        mediaRecorder.resume()
        this._updateStatus(RECORDING_STATUS.RECORDING)
      }
    },

    async stop(): Promise<void> {
      if (mediaRecorder && status !== RECORDING_STATUS.IDLE) {
        this._updateStatus(RECORDING_STATUS.STOPPING)
        
        if (timerInterval) {
          clearInterval(timerInterval)
        }

        return new Promise((resolve) => {
          if (!mediaRecorder) {
            resolve()
            return
          }
          
          mediaRecorder.onstop = () => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop())
            }
            this._updateStatus(RECORDING_STATUS.COMPLETED)
            resolve()
          }
          
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
          } else {
            this._updateStatus(RECORDING_STATUS.COMPLETED)
            resolve()
          }
        })
      }
    },

    async exportVideo(filename = 'xiangyi-demo'): Promise<Blob> {
      if (recordedChunks.length === 0) {
        throw new Error('没有录制数据')
      }

      const mimeType = this._getSupportedMimeType()
      const blob = new Blob(recordedChunks, { type: mimeType })
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${formatTimestamp(new Date())}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return blob
    },

    getPreviewUrl(): string | null {
      if (recordedChunks.length === 0) return null
      const blob = new Blob(recordedChunks, { type: this._getSupportedMimeType() })
      return URL.createObjectURL(blob)
    },

    reset() {
      this.stop()
      recordedChunks = []
      duration = 0
      startTime = null
      this._updateStatus(RECORDING_STATUS.IDLE)
    },
  }

  return recorder
}

function pad(num: number, length = 2): string {
  return String(num).padStart(length, '0')
}

function formatTimestamp(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${pad(mins)}:${pad(secs)}`
}
