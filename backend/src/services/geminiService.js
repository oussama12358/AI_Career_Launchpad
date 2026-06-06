import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.candidates[0].content.parts[0].text;
};

// Generate AI bio from CV text
const generateBio = async (cvText, name) => {
  if (!process.env.GEMINI_API_KEY) {
    return `Experienced professional with proven skills in software development and portfolio delivery. ${name} builds effective developer experiences using modern tools and clean architecture.`;
  }

  const prompt = `Based on this CV/resume content, write a compelling 3-sentence professional bio for ${name}. 
Make it sound confident, modern, and suitable for a portfolio website. 
CV Content: ${cvText.substring(0, 3000)}
Return only the bio text, no extra formatting.`;
  return await callGemini(prompt);
};

// Generate resume feedback
const generateResumeFeedback = async (cvText) => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      score: 70,
      strengths: ['Clear technical experience', 'Relevant development skills', 'Strong project orientation'],
      improvements: ['Add more metrics to your achievements', 'Highlight recent technical projects', 'Include tools and frameworks used'],
      keywords_missing: ['AWS', 'Docker', 'CI/CD'],
      summary: 'AI feedback is unavailable because the Gemini API key is not configured. Please add GEMINI_API_KEY to enable rich resume analysis.',
    };
  }
  const prompt = `Analyze this resume and provide structured feedback in JSON format with these exact keys:
{
  "score": <number 0-100>,
  "strengths": [<list of 3-4 strengths>],
  "improvements": [<list of 3-4 specific improvements>],
  "keywords_missing": [<list of important keywords not present>],
  "summary": "<2-sentence overall assessment>"
}
Resume: ${cvText.substring(0, 3000)}
Return ONLY valid JSON, no markdown.`;

  const text = await callGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { score: 70, strengths: [], improvements: [], keywords_missing: [], summary: text };
  }
};

// Generate AI project description
const generateProjectDescription = async (projectName, techStack, readmeText = '') => {
  if (!process.env.GEMINI_API_KEY) {
    return `${projectName} is a modern project built with ${techStack.join(', ')}. It demonstrates strong development skills and practical experience in building real-world applications.`;
  }

  const prompt = `Write a professional 2-3 sentence project description for a portfolio website.
Project name: ${projectName}
Tech stack: ${techStack.join(', ')}
${readmeText ? `README snippet: ${readmeText.substring(0, 500)}` : ''}
Make it engaging and highlight technical skills. Return only the description text.`;
  return await callGemini(prompt);
};

// Generate skill gap analysis
const generateSkillGapAnalysis = async (detectedSkills, targetRole = 'Full Stack Developer') => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      missing_skills: ['Docker', 'CI/CD', 'AWS'],
      recommended_courses: [
        { skill: 'Docker', resource: 'https://www.docker.com/get-started' },
        { skill: 'CI/CD', resource: 'https://www.redhat.com/en/topics/devops/what-is-ci-cd' },
      ],
      career_tips: ['Add tangible project outcomes', 'Include recent tools and frameworks', 'Focus on measurable achievements'],
      readiness_score: 55,
    };
  }
  const prompt = `Given a developer with these skills: ${detectedSkills.join(', ')}
And their target role: ${targetRole}

Provide a skill gap analysis in JSON format:
{
  "missing_skills": [<list of important missing skills>],
  "recommended_courses": [{"skill": "<name>", "resource": "<free resource URL or platform>"}],
  "career_tips": [<3 actionable career tips>],
  "readiness_score": <0-100>
}
Return ONLY valid JSON, no markdown.`;

  const text = await callGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { missing_skills: [], recommended_courses: [], career_tips: [], readiness_score: 50 };
  }
};

// Generate interview questions
const generateInterviewQuestions = async (skills, cvText) => {
  if (!process.env.GEMINI_API_KEY) {
    return skills.map((skill, i) => ({
      question: `Describe a project where you used ${skill}.`,
      type: 'technical',
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      hint: `Talk about your experience with ${skill} and the outcomes.`,
    }));
  }
  const prompt = `Generate 10 technical interview questions for a developer with these skills: ${skills.join(', ')}.
Mix behavioral and technical questions. Format as JSON array:
[{"question": "<question>", "type": "technical|behavioral", "difficulty": "easy|medium|hard", "hint": "<brief answer hint>"}]
Return ONLY valid JSON, no markdown.`;

  const text = await callGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return [];
  }
};

// Generate portfolio score
const generatePortfolioScore = async (portfolioData) => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      score: 65,
      breakdown: { projects: 15, skills: 15, bio: 20, completeness: 15 },
      advice: 'Add more details to your projects and highlight your strongest skills for a better portfolio presentation.',
    };
  }
  const prompt = `Score this developer portfolio from 0-100 based on completeness and quality.
Portfolio data: ${JSON.stringify(portfolioData).substring(0, 2000)}
Return JSON: {"score": <number>, "breakdown": {"projects": <0-25>, "skills": <0-25>, "bio": <0-25>, "completeness": <0-25>}, "advice": "<one sentence improvement tip>"}
Return ONLY valid JSON, no markdown.`;

  const text = await callGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { score: 60, breakdown: {}, advice: '' };
  }
};

export {
  generateBio,
  generateResumeFeedback,
  generateProjectDescription,
  generateSkillGapAnalysis,
  generateInterviewQuestions,
  generatePortfolioScore,
};
