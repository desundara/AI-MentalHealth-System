const assessMood = async ({ mood_score, sleep_hours, stress_level, anxiety_level, symptoms, notes }) => {
  try {
    const prompt = `You are a mental health screening assistant. Analyze the following daily mood log and provide a structured assessment.

Mood Data:
- Mood Score: ${mood_score}/10 (1=very bad, 10=excellent)
- Sleep Hours: ${sleep_hours || 'Not provided'}
- Stress Level: ${stress_level ? stress_level + '/10' : 'Not provided'}
- Anxiety Level: ${anxiety_level ? anxiety_level + '/10' : 'Not provided'}
- Symptoms: ${symptoms || 'None reported'}
- User Notes: ${notes || 'None'}

Respond ONLY with a valid JSON object in this exact format (no extra text):
{
    "risk_level": "Low" or "Medium" or "High",
    "summary": "2-3 sentence analysis of the user mental state",
    "suggestions": "3-4 practical coping suggestions separated by | character"
    }

    Risk level guidelines:
    - Low: mood 7-10, low stress/anxiety, good sleep
    - Medium: mood 4-6, moderate stress/anxiety, some symptoms  
    - High: mood 1-3, high stress/anxiety, multiple concerning symptoms`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.OPENAI_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }]
        })
        });

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
    } catch (err) {
        console.error('AI assessment error:', err);
        // Fallback rule-based assessment
        let risk_level = 'Low';
        if (mood_score <= 3 || stress_level >= 8 || anxiety_level >= 8) risk_level = 'High';
        else if (mood_score <= 6 || stress_level >= 5 || anxiety_level >= 5) risk_level = 'Medium';
        return {
        risk_level,
        summary: 'Assessment based on your mood data. Please consider speaking with a counselor if you are struggling.',
        suggestions: 'Take a short walk outside|Practice deep breathing for 5 minutes|Reach out to a friend or family member|Try to get 7-8 hours of sleep tonight'
        };
    }
};

module.exports = { assessMood };
