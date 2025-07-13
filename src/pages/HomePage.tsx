import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Button, Card, Chip, Paper, Stack, CircularProgress, Snackbar
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEmotionDetector } from '../hooks/useEmotionDetector'
import { generateStory } from '../api/generateStory'
import { socket } from '../sockets/socket'
import { emotionEmojiMap } from '../emotionMap'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import Particles from 'react-tsparticles'
import { useWindowSize } from 'react-use'

export default function HomePage() {
  const { videoRef, emotion, expressions, detectOnce } = useEmotionDetector()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)   // ✅ typed properly
  const [story, setStory] = useState<string>('')            // ✅ typed
  const [displayed, setDisplayed] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const { videoWidth: w, videoHeight: h } = videoRef.current
    canvasRef.current.width = w
    canvasRef.current.height = h
    ctx.clearRect(0, 0, w, h)
  }, [expressions])

  const handleGenerate = async () => {
    try {
      setLoading(true)
      await detectOnce()
      if (history.length === 0) setShowConfetti(true)
      const part = await generateStory(story, emotion)
      setHistory(h => [...h, emotion])
      setStory(s => s + '\n\n' + part)
    } catch (e) {
      setError('Failed to generate story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let i = 0
    setDisplayed('')
    const typingSpeed = 2
    const iv = setInterval(() => {
      setDisplayed(story.slice(0, i) + (i < story.length ? '|' : ''))
      i += typingSpeed
      if (i > story.length) clearInterval(iv)
    }, 10)
    return () => clearInterval(iv)
  }, [story])

  useEffect(() => {
    socket.on('story', (newPart: string) => {
      setStory(s => s + '\n\n' + newPart)
    })
    return () => void socket.off('story')
  }, [])

  useEffect(() => {
    socket.emit('emotion', emotion)
  }, [emotion])

  const data = Object.entries(
    history.reduce<Record<string, number>>((acc, e) => {
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {})
  ).map(([emo, count]) => ({ emotion: emo, count }))

  useEffect(() => {
    detectOnce() // run immediately on load
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', minWidth:'100vw', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: '#fff', py: 4, px: 2, textAlign: 'center', position: 'relative' }}>
      <Particles
        options={{
          background: { color: 'transparent' },
          particles: { color: { value: '#00b4db' }, number: { value: 50 }, size: { value: 2 }, move: { enable: true, speed: 0.5 } }
        }}
      />
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ background: 'linear-gradient(90deg, #00b4db, #0083b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
          🎭 AI Story Theater
        </Typography>
        <Typography variant="subtitle1" color="gray" mb={4}>
          Where Your Emotions Shape the Story
        </Typography>
      </motion.div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
        <Box position="relative" display="inline-block" borderRadius={4} overflow="hidden" boxShadow="0 0 30px rgba(0,180,219,0.5)" mb={3}>
          <video ref={videoRef} width={340} muted autoPlay style={{ borderRadius: '16px' }} />
          <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </Box>
      </motion.div>

      <Typography variant="h6" mb={1}>
        Detected emotion: <strong style={{ color: '#00b4db' }}>{emotion} {emotionEmojiMap[emotion]}</strong>
        {expressions ? ` (${Number(expressions?.[emotion as keyof typeof expressions] || 0).toFixed(2)})` : ''}
      </Typography>

      {expressions && Object.keys(expressions).length > 0 && (
        <Stack direction="row" justifyContent="center" flexWrap="wrap" spacing={1} mb={3}>
          {Object.entries(expressions).map(([expr, prob]) => (
            <Chip key={expr} label={`${expr}: ${(prob * 100).toFixed(1)}%`} sx={{ bgcolor: '#2d2d3a', color: '#fff', border: '1px solid #444' }} />
          ))}
        </Stack>
      )}

      <motion.div whileHover={{ scale: 1.05 }}>
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleGenerate} sx={{ mb: 3, px: 4, py: 1.5, fontSize: '1rem', borderRadius: '999px', background: 'linear-gradient(90deg, #00b4db, #0083b0)', boxShadow: '0 0 10px #00b4db', '&:hover': { background: 'linear-gradient(90deg, #0083b0, #00b4db)' } }}>
          Next
        </Button>
      </motion.div>

      {loading && <CircularProgress color="info" sx={{ mt: 2 }} />}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Card sx={{ maxWidth: 700, mx: 'auto', bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', p: 3, textAlign: 'left', borderRadius: 4, mb: 4 }}>
          <Typography component="pre" whiteSpace="pre-wrap" sx={{ fontFamily: 'inherit', fontSize: '1rem', color: '#ddd' }}>{displayed}</Typography>
        </Card>

        <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3, bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }} elevation={4}>
          <Typography variant="h6" mb={2} color="#00b4db">Emotion Heatmap</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="emotion" stroke="#aaa" />
              <YAxis allowDecimals={false} stroke="#aaa" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} itemStyle={{ color: '#00b4db' }} />
              <Legend wrapperStyle={{ color: '#aaa' }} />
              <Bar dataKey="count" fill="#00b4db" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </motion.div>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} message={error} />
    </Box>
  )
}
