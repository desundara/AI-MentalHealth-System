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

    Respond ONLY with a valid JSON object in this exact format (no extra text, no markdown backticks):
    {
    "risk_level": "Low",
    "summary": "2-3 sentence analysis of the user mental state",
    "suggestions": "suggestion one|suggestion two|suggestion three|suggestion four"
    }

    IMPORTANT: The suggestions field must use the pipe character | as separator between suggestions. Example: "Take a walk|Drink water|Sleep early|Talk to someone"

    Risk level rules:
    - Low: mood 7-10, stress/anxiety below 5, good sleep, few symptoms
    - Medium: mood 4-6, stress/anxiety 5-7, some symptoms
    - High: mood 1-3, stress/anxiety 8-10, multiple concerning symptoms`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            max_tokens: 500,
            temperature: 0.7,
            messages: [
            {
                role: 'system',
                content: 'You are a mental health screening assistant. Always respond with valid JSON only. Use pipe character | to separate suggestions.'
            },
            { role: 'user', content: prompt }
            ]
        })
        });

        const data = await response.json();

        if (data.error) {
        console.error('Groq API error:', data.error);
        throw new Error(data.error.message);
        }

        const text = data.choices?.[0]?.message?.content || '';
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        // Normalize suggestions — if comma separated convert to pipe
        if (parsed.suggestions && !parsed.suggestions.includes('|')) {
        parsed.suggestions = parsed.suggestions.split(',').map(s => s.trim()).join('|');
        }

        return parsed;

    } catch (err) {
        console.error('AI assessment error:', err.message);

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