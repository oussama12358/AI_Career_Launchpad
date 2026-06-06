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

export default router;
