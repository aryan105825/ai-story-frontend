import { Box, Typography, Button, Stack, Paper } from '@mui/material'
import { motion } from 'framer-motion'
import Particles from 'react-tsparticles'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        color: '#fff',
        px: 3,
        py: { xs: 4, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Particles */}
      <Particles
        options={{
          background: { color: 'transparent' },
          particles: {
            color: { value: '#00b4db' },
            number: { value: 50 },
            size: { value: 2 },
            move: { enable: true, speed: 0.6 },
            opacity: { value: 0.5 }
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ textAlign: 'center', maxWidth: 800 }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(90deg, #00b4db, #0083b0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          🎭 AI Story Theater
        </Typography>
        <Typography variant="h6" color="#ccc" mb={2}>
          Your emotions create the story.
        </Typography>
        <Typography variant="body1" color="#aaa" mb={4}>
          Dive into real-time storytelling shaped by your expressions. Let AI craft unique narratives that reflect your mood.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/home')}   // navigate on click
          sx={{
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #00b4db, #0083b0)',
            boxShadow: '0 0 20px #00b4db',
            '&:hover': { background: 'linear-gradient(90deg, #0083b0, #00b4db)' }
          }}
        >
          Get Started
        </Button>
      </motion.div>

      {/* Feature blocks */}
      <Stack spacing={4} mt={6} width="100%" maxWidth={1000}>
        {[
          { icon: '🧠', title: 'Real-Time Emotion Detection', desc: 'AI reads your facial expressions to guide the narrative moment by moment.' },
          { icon: '🎬', title: 'Dynamic Story Engine', desc: 'Plots, scenes, and dialogues evolve instantly based on your emotions.' },
          { icon: '✨', title: 'Immersive Cinematic UI', desc: 'Beautiful gradients, smooth animations, and elegant visuals keep you engaged.' }
        ].map((feature, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                textAlign: 'left'
              }}
              elevation={4}
            >
              <Typography variant="h5" mb={1} color="#00b4db">
                {feature.icon} {feature.title}
              </Typography>
              <Typography variant="body2" color="#ccc">
                {feature.desc}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Stack>

      {/* Footer */}
      <Typography variant="caption" mt={6} color="#888">
        © 2025 AI Story Theater. All rights reserved.
      </Typography>
    </Box>
  )
}
