import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import authMiddleware from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as resumeController from '../controllers/resumeController.js';
import * as githubController from '../controllers/githubController.js';
import * as portfolioController from '../controllers/portfolioController.js';
import * as projectController from '../controllers/projectController.js';
import * as customizationController from '../controllers/customizationController.js';
import * as skillsController from '../controllers/skillsController.js';
import * as analyticsController from '../controllers/analyticsController.js';
import * as projectShowcaseController from '../controllers/projectShowcaseController.js';
import { generateResumePDF } from '../services/resumePdfService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

// ── Auth routes ────────────────────────────────────────────────
router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  authController.register
);

router.post(
  '/auth/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.get('/auth/me', authMiddleware, authController.getMe);

// ── Resume routes ──────────────────────────────────────────────
router.post('/resume/upload', authMiddleware, upload.single('resume'), resumeController.uploadResume);
router.get('/resume', authMiddleware, resumeController.getResume);

// ── GitHub routes ──────────────────────────────────────────────
router.post('/github/connect', authMiddleware, githubController.connectGitHub);
router.get('/github', authMiddleware, githubController.getGitHubProfile);

// ── Portfolio routes ───────────────────────────────────────────
router.post('/portfolio/generate', authMiddleware, portfolioController.generatePortfolio);
router.get('/portfolio', authMiddleware, portfolioController.getPortfolio);
router.put('/portfolio', authMiddleware, portfolioController.updatePortfolio);
router.get('/portfolio/public/:slug', portfolioController.getPublicPortfolio);

// ── Projects routes ────────────────────────────────────────────
router.get('/projects', authMiddleware, projectController.getProjects);
router.post('/projects', authMiddleware, projectController.createProject);
router.delete('/projects/:id', authMiddleware, projectController.deleteProject);
router.post('/projects/:id/regenerate', authMiddleware, projectController.regenerateDescription);

// ── Portfolio Customization routes ────────────────────────────
router.get('/customization/themes', customizationController.getThemes);
router.get('/customization/:portfolioId', authMiddleware, customizationController.getCustomization);
router.put('/customization/:portfolioId', authMiddleware, customizationController.updateCustomization);

// ── Skills Management routes ──────────────────────────────────
router.get('/skills', authMiddleware, skillsController.getUserSkills);
router.post('/skills', authMiddleware, skillsController.addSkill);
router.put('/skills/:skillId', authMiddleware, skillsController.updateSkillProficiency);
router.delete('/skills/:skillId', authMiddleware, skillsController.deleteSkill);
router.post('/skills/:skillId/endorse', authMiddleware, skillsController.endorseSkill);
router.delete('/skills/:skillId/endorse', authMiddleware, skillsController.removeEndorsement);

// ── Project Showcase routes ───────────────────────────────────
router.put('/projects/:projectId/showcase', authMiddleware, projectShowcaseController.updateProjectShowcase);
router.get('/projects/featured', authMiddleware, projectShowcaseController.getFeaturedProjects);
router.post('/projects/featured/reorder', authMiddleware, projectShowcaseController.reorderFeaturedProjects);

// ── Portfolio Analytics & Sharing routes ──────────────────────
router.get('/analytics/:portfolioId', authMiddleware, analyticsController.getAnalytics);
router.post('/analytics/:portfolioId/track', analyticsController.trackView);
router.post('/analytics/:portfolioId/share', authMiddleware, analyticsController.createShareLink);
router.get('/analytics/:portfolioId/shares', authMiddleware, analyticsController.getShareLinks);
router.delete('/analytics/share/:shareId', authMiddleware, analyticsController.deleteShareLink);

// ── Resume PDF Export route ───────────────────────────────────
router.get('/resume/download/:format', authMiddleware, async (req, res) => {
  try {
    const pdfBuffer = await generateResumePDF(req.user.id, req.params.format || 'modern');
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume_${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ error: 'Failed to generate resume PDF' });
  }
});

export default router;
