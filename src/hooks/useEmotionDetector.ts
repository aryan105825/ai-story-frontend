// src/hooks/useEmotionDetector.ts
import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

export function useEmotionDetector() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [emotion, setEmotion] = useState('neutral')
  const [expressions, setExpressions] = useState<faceapi.FaceExpressions | null>(null)
  const emotionBuffer = useRef<string[]>([])

  const detectOnce = async () => {
    if (!videoRef.current) return
    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()

    if (result?.expressions) {
      setExpressions(result.expressions)
      const sorted = Object.entries(result.expressions).sort(([, a], [, b]) => b - a)
      const [topEmotion] = sorted[0]

      // push to buffer
      emotionBuffer.current.push(topEmotion)
      if (emotionBuffer.current.length > 10) { // buffer size 10
        emotionBuffer.current.shift()
      }

      // get most frequent emotion in buffer
      const counts = emotionBuffer.current.reduce<Record<string, number>>((acc, e) => {
        acc[e] = (acc[e] || 0) + 1
        return acc
      }, {})
      const mostFrequent = Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0]

      setEmotion(mostFrequent)
    } else {
      setEmotion('neutral')
    }
  }

  useEffect(() => {
    const init = async () => {
      const MODEL_URL = "/models"
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

      if (navigator.mediaDevices && videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const detectLoop = async () => {
        await detectOnce()
        requestAnimationFrame(detectLoop)
      }
      detectLoop()
    }
    init()
  }, [])

  return { videoRef, emotion, expressions, detectOnce }
}
