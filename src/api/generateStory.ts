export async function generateStory(storySoFar: string, emotion: string): Promise<string> {
  const randomMarker = Math.random().toString(36).substring(2, 8)

  const prompt = `
The story so far:
${storySoFar}

Now, continue the story. 
The narrator must vividly reflect the user's current emotion: "${emotion}".
Use words, metaphors, and style that show this emotion through the events and tone.
Do NOT mention the emotion itself directly. 
Be creative, immersive, and unexpected.
Paragraph must be at least 5–6 sentences.

[Random marker: ${randomMarker}]
`.trim()

  const apiKey = import.meta.env.VITE_GROQ_API_KEY || 'PUT_YOUR_KEY_HERE'

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
          body: JSON.stringify({
        model: 'llama3-70b-8192',  
        temperature: 1.1,
        messages: [
          { role: 'system', content: 'You are an AI storyteller. Each paragraph must reflect the new emotion with vivid style and narrative tone. Avoid repetition.' },
          { role: 'user', content: prompt }
        ]
      })

    }
  )

  if (!response.ok) {
    throw new Error('Groq API returned error')
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}
