import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import pool from '../config/database.js';
import * as gemini from '../services/geminiService.js';

// Extract skills from CV text
const extractSkills = (text) => {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'Linux',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'GraphQL', 'REST', 'API',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'scikit-learn',
    'Flutter', 'React Native', 'Swift', 'Kotlin', 'Android', 'iOS',
    'Figma', 'UI/UX', 'Agile', 'Scrum', 'DevOps',
  ];
  const lowerText = text.toLowerCase();
  return skillKeywords.filter((skill) => lowerText.includes(skill.toLowerCase()));
};

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;

    const skills = extractSkills(rawText);

    // AI feedback
    let feedback;
    try {
      feedback = await gemini.generateResumeFeedback(rawText);
    } catch (feedbackError) {
      console.error('Resume feedback error:', feedbackError);
      feedback = {
        score: 70,
        strengths: [],
        improvements: [],
        keywords_missing: [],
        summary: 'AI resume feedback is currently unavailable. Your resume was still uploaded successfully.',
      };
    }

    // Save to DB
    const existing = await pool.query('SELECT id FROM resumes WHERE user_id = $1', [req.user.id]);
    let result;

    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE resumes SET file_name=$1, file_path=$2, raw_text=$3, parsed_data=$4, ai_feedback=$5, score=$6, updated_at=NOW()
         WHERE user_id=$7 RETURNING *`,
        [
          req.file.originalname,
          req.file.path,
          rawText,
          JSON.stringify({ skills }),
          JSON.stringify(feedback),
          feedback.score || 70,
          req.user.id,
        ]
      );
    } else {
      result = await pool.query(
        `INSERT INTO resumes (user_id, file_name, file_path, raw_text, parsed_data, ai_feedback, score)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          req.user.id,
          req.file.originalname,
          req.file.path,
          rawText,
          JSON.stringify({ skills }),
          JSON.stringify(feedback),
          feedback.score || 70,
        ]
      );
    }

    res.json({
      message: 'Resume uploaded and analyzed',
      resume: result.rows[0],
      skills,
      feedback,
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Failed to process resume' });
  }
};

// GET /api/resume
const getResume = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumes WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No resume found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { uploadResume, getResume };
