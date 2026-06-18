import PDFDocument from 'pdfkit';
import pool from '../config/database.js';

const THEMES = {
  modern: {
    accent: '#0f766e',
    accentDark: '#134e4a',
    accentSoft: '#ccfbf1',
    secondary: '#f59e0b',
    pageBg: '#f7faf9',
    cardBg: '#ffffff',
    border: '#d8e2df',
    bodyText: '#172a28',
    mutedText: '#61706d',
    inverseText: '#ffffff',
  },
  minimal: {
    accent: '#374151',
    accentDark: '#111827',
    accentSoft: '#f3f4f6',
    secondary: '#0f766e',
    pageBg: '#fbfbfa',
    cardBg: '#ffffff',
    border: '#d9d9d6',
    bodyText: '#1f2937',
    mutedText: '#6b7280',
    inverseText: '#ffffff',
  },
  professional: {
    accent: '#1d4ed8',
    accentDark: '#1e3a8a',
    accentSoft: '#dbeafe',
    secondary: '#b45309',
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#d7dee8',
    bodyText: '#172033',
    mutedText: '#667085',
    inverseText: '#ffffff',
  },
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 25,
  bottom: 30,
};

const TEMPLATE_COPY = {
  modern: {
    label: 'Modern impact resume',
    footer: 'Modern resume export',
    emptyTitle: 'Portfolio-ready additions',
  },
  minimal: {
    label: 'Clean editorial resume',
    footer: 'Minimal resume export',
    emptyTitle: 'Content to add next',
  },
  professional: {
    label: 'Professional profile dossier',
    footer: 'Professional resume export',
    emptyTitle: 'Executive completion notes',
  },
};

// Generate PDF from resume data
export const generateResumePDF = async (userId, templateStyle = 'modern') => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name, u.email, u.avatar_url
       FROM resumes r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.uploaded_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No resume found');
    }

    const resume = result.rows[0];
    const parsedData = resume.parsed_data || {};

    return renderResumePDF(
      {
        name: resume.name,
        email: resume.email,
        phone: parsedData.phone,
        location: parsedData.location,
        summary: parsedData.summary,
        experience: normalizeList(parsedData.experience),
        education: normalizeList(parsedData.education),
        skills: normalizeList(parsedData.skills),
      },
      templateStyle
    );
  } catch (err) {
    console.error('Error generating resume PDF:', err);
    throw err;
  }
};

export function renderResumePDF(resume, templateStyle = 'modern') {
  const style = THEMES[templateStyle] ? templateStyle : 'modern';
  const theme = THEMES[style];
  const safeResume = {
    ...resume,
    name: toText(resume?.name) || 'Your Name',
    email: toText(resume?.email),
    phone: toText(resume?.phone),
    location: toText(resume?.location),
    summary: toText(resume?.summary),
    experience: normalizeList(resume?.experience),
    education: normalizeList(resume?.education),
    skills: normalizeList(resume?.skills).map(toText).filter(Boolean),
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: PAGE.margin, right: PAGE.margin, bottom: PAGE.bottom, left: PAGE.margin },
      bufferPages: true,
      info: {
        Title: `${safeResume.name} Resume`,
        Subject: TEMPLATE_COPY[style].label,
      },
    });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawPageChrome(doc, theme, style);
    drawHeader(doc, safeResume, theme, style);
    renderTemplateBody(doc, safeResume, theme, style);

    addFooterToAllPages(doc, theme, style);

    doc.end();
  });
}

function renderTemplateBody(doc, resume, theme, style) {
  if (style === 'modern') {
    renderModern(doc, resume, theme, style);
    return;
  }
  if (style === 'professional') {
    renderProfessional(doc, resume, theme, style);
    return;
  }
  renderMinimal(doc, resume, theme, style);
}

function renderModern(doc, resume, theme, style) {
  const mainX = 160;
  const mainW = PAGE.width - mainX - PAGE.margin;
  const sideX = PAGE.margin;
  const sideW = 100;

  drawSidebar(doc, resume, theme, style, sideX, 140, sideW);
  doc.y = 160;

  if (resume.summary) {
    addCardSection(doc, 'Summary', theme, mainX, mainW, () => {
      addParagraph(doc, resume.summary, theme, mainX + 12, mainW - 24);
    }, { compact: true });
  }

  addExperienceSection(doc, resume, theme, mainX, mainW, style);
  addEducationSection(doc, resume, theme, mainX, mainW);
  addCompletionPanel(doc, resume, theme, mainX, mainW);
}

function renderProfessional(doc, resume, theme, style) {
  const leftX = PAGE.margin;
  const leftW = 328;
  const rightX = leftX + leftW + 20;
  const rightW = PAGE.width - rightX - PAGE.margin;

  doc.y = 150;
  addCardSection(doc, 'Executive Profile', theme, leftX, leftW, () => {
    addParagraph(
      doc,
      resume.summary || 'Add a concise executive profile that explains your target role, strongest capabilities, and the business value you bring.',
      theme,
      leftX + 16,
      leftW - 32
    );
  });

  addExperienceSection(doc, resume, theme, leftX, leftW, style);
  addEducationSection(doc, resume, theme, leftX, leftW);

  doc.y = 150;
  addRightRail(doc, resume, theme, style, rightX, rightW);
  addCompletionPanel(doc, resume, theme, rightX, rightW);
}

function renderMinimal(doc, resume, theme, style) {
  const leftX = PAGE.margin;
  const leftW = 150;
  const rightX = leftX + leftW + 24;
  const rightW = PAGE.width - rightX - PAGE.margin;

  drawMinimalRail(doc, resume, theme, leftX, 178, leftW);

  doc.y = 178;
  addCardSection(doc, 'Profile', theme, rightX, rightW, () => {
    addParagraph(
      doc,
      resume.summary || 'Add a concise profile paragraph that connects your technical strengths with the work you want to do next.',
      theme,
      rightX + 16,
      rightW - 32
    );
  });

  addExperienceSection(doc, resume, theme, rightX, rightW, style);
  addEducationSection(doc, resume, theme, rightX, rightW);
  addCompletionPanel(doc, resume, theme, rightX, rightW);
}

function drawPageChrome(doc, theme, style) {
  doc.save();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(theme.pageBg);

  if (style === 'modern') {
    doc.rect(0, 0, 166, PAGE.height).fill(theme.accentDark);
    doc.rect(166, 0, 12, PAGE.height).fill(theme.secondary);
    doc.circle(64, 76, 84).fillOpacity(0.11).fill('#ffffff').fillOpacity(1);
    doc.circle(150, 18, 42).fillOpacity(0.14).fill(theme.secondary).fillOpacity(1);
  } else if (style === 'professional') {
    doc.rect(0, 0, PAGE.width, 132).fill(theme.accentDark);
    doc.rect(0, 132, PAGE.width, 8).fill(theme.secondary);
    doc.rect(PAGE.width - 78, 140, 18, PAGE.height - 210).fill(theme.accentSoft);
    doc.rect(PAGE.width - 54, 140, 5, PAGE.height - 210).fill(theme.accent);
  } else {
    doc.rect(PAGE.margin, 38, PAGE.width - PAGE.margin * 2, 1.2).fill(theme.border);
    doc.rect(PAGE.margin, 132, PAGE.width - PAGE.margin * 2, 2).fill(theme.accentDark);
    doc.circle(PAGE.width - 74, 82, 30).fill(theme.accentSoft);
  }
  doc.restore();
}

function drawHeader(doc, resume, theme, style) {
  if (style === 'modern') {
    drawModernHeader(doc, resume, theme);
  } else if (style === 'professional') {
    drawProfessionalHeader(doc, resume, theme);
  } else {
    drawMinimalHeader(doc, resume, theme);
  }
}

function drawModernHeader(doc, resume, theme) {
  const initials = getInitials(resume.name);
  doc.save();
  doc.circle(70, 68, 26).fill(theme.secondary);
  doc
    .fillColor(theme.accentDark)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(initials, 50, 61, { width: 40, align: 'center' });

  doc
    .fillColor(theme.bodyText)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(resume.name, 160, 50, { width: 270, lineGap: 1 });
  doc
    .fillColor(theme.accent)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('PORTFOLIO RESUME', 162, 100, { width: 120 });
  doc
    .roundedRect(310, 96, 110, 18, 3)
    .fill(theme.cardBg);
  doc
    .fillColor(theme.mutedText)
    .font('Helvetica')
    .fontSize(7)
    .text(TEMPLATE_COPY.modern.label, 320, 102, { width: 90 });
  doc.restore();
}

function drawProfessionalHeader(doc, resume, theme) {
  const contact = [resume.email, resume.phone, resume.location].filter(Boolean).join('  |  ');
  doc.save();
  doc
    .fillColor(theme.inverseText)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(resume.name, PAGE.margin, 44, { width: 360, lineGap: 2 });
  doc
    .fillColor('#bfdbfe')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(TEMPLATE_COPY.professional.label.toUpperCase(), PAGE.margin, 105, { width: 250 });
  if (contact) {
    doc
      .fillColor('#dbeafe')
      .font('Helvetica')
      .fontSize(8.7)
      .text(contact, 286, 56, { width: 252, align: 'right', lineGap: 3 });
  }
  doc.restore();
}

function drawMinimalHeader(doc, resume, theme) {
  const contact = [resume.email, resume.phone, resume.location].filter(Boolean).join(' / ');
  doc.save();
  doc
    .fillColor(theme.bodyText)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(resume.name, PAGE.margin, 58, { width: 380, lineGap: 2 });
  doc
    .fillColor(theme.secondary)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(TEMPLATE_COPY.minimal.label.toUpperCase(), PAGE.margin, 106, { width: 230 });
  if (contact) {
    doc
      .fillColor(theme.mutedText)
      .font('Helvetica')
      .fontSize(8.8)
      .text(contact, 330, 72, { width: 178, align: 'right', lineGap: 3 });
  }
  doc.restore();
}

function drawSidebar(doc, resume, theme, style, x, y, width) {
  doc.save();
  doc
    .fillColor('#ccfbf1')
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('CONTACT', x, y, { width });
  const contact = [
    ['Email', resume.email],
  ].filter(([, value]) => value);
  let cursor = y + 14;
  if (contact.length === 0) {
    addSmallRailText(doc, 'Add email', x, cursor, width, theme, true);
    cursor += 20;
  } else {
    contact.forEach(([label, value]) => {
      doc.fillColor('#99f6e4').font('Helvetica-Bold').fontSize(6.5).text(label.toUpperCase(), x, cursor, { width });
      doc.fillColor('#ffffff').font('Helvetica').fontSize(7).text(toText(value), x, cursor + 7, { width, lineGap: 1 });
      cursor += 20;
    });
  }

  cursor += 4;
  doc.fillColor('#ccfbf1').font('Helvetica-Bold').fontSize(8).text('SKILLS', x, cursor, { width });
  cursor += 12;
  const visibleSkills = resume.skills.slice(0, 8);
  if (visibleSkills.length === 0) {
    addSmallRailText(doc, 'Add skills', x, cursor, width, theme, true);
    cursor += 20;
  } else {
    visibleSkills.forEach((skill) => {
      doc.roundedRect(x, cursor, width, 14, 2).fill('#0d5f59');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.5).text(skill, x + 6, cursor + 4, { width: width - 12, ellipsis: true });
      cursor += 16;
    });
  }

  cursor += 6;
  doc.fillColor('#ccfbf1').font('Helvetica-Bold').fontSize(8).text('FOCUS', x, cursor, { width });
  addSmallRailText(doc, getFocusLine(resume).substring(0, 60), x, cursor + 12, width, theme, false);
  doc.restore();
}

function addRightRail(doc, resume, theme, style, x, width) {
  addCardSection(doc, 'Contact', theme, x, width, () => {
    const contacts = [
      ['Email', resume.email],
      ['Phone', resume.phone],
      ['Location', resume.location],
    ].filter(([, value]) => value);
    if (!contacts.length) {
      addParagraph(doc, 'Add email, phone, and location details.', theme, x + 14, width - 28);
    } else {
      contacts.forEach(([label, value]) => {
        doc.fillColor(theme.mutedText).font('Helvetica-Bold').fontSize(7.5).text(label.toUpperCase(), x + 14, doc.y, { width: width - 28 });
        doc.fillColor(theme.bodyText).font('Helvetica').fontSize(8.6).text(toText(value), x + 14, doc.y + 2, { width: width - 28, lineGap: 2 });
        doc.moveDown(0.6);
      });
    }
  }, { compact: true });

  addCardSection(doc, 'Core Skills', theme, x, width, () => {
    const skills = resume.skills.slice(0, 14);
    if (!skills.length) {
      addParagraph(doc, 'Add role-specific technical and collaboration skills.', theme, x + 14, width - 28);
    } else {
      addSkills(doc, skills, theme, x + 14, width - 28, { small: true });
    }
  }, { compact: true });

  addCardSection(doc, 'Focus', theme, x, width, () => {
    addParagraph(doc, getFocusLine(resume), theme, x + 14, width - 28);
  }, { compact: true });
}

function drawMinimalRail(doc, resume, theme, x, y, width) {
  doc.save();
  addRailGroup(doc, 'Contact', [
    resume.email || 'Add email',
    resume.phone || 'Add phone',
    resume.location || 'Add location',
  ], theme, x, y, width);

  addRailGroup(doc, 'Skills', resume.skills.length ? resume.skills.slice(0, 12) : ['Add core skills', 'Add tools', 'Add frameworks'], theme, x, y + 152, width);
  addRailGroup(doc, 'Profile Focus', [getFocusLine(resume)], theme, x, y + 376, width);
  doc.restore();
}

function addRailGroup(doc, title, items, theme, x, y, width) {
  doc.fillColor(theme.accentDark).font('Helvetica-Bold').fontSize(9).text(title.toUpperCase(), x, y, { width });
  doc.moveTo(x, y + 14).lineTo(x + width, y + 14).lineWidth(0.8).strokeColor(theme.border).stroke();
  let cursor = y + 26;
  items.filter(Boolean).forEach((item) => {
    doc.circle(x + 3, cursor + 4, 2).fill(theme.secondary);
    doc.fillColor(theme.bodyText).font('Helvetica').fontSize(8.5).text(toText(item), x + 12, cursor, { width: width - 12, lineGap: 2 });
    cursor = doc.y + 9;
  });
}

function addMetricStrip(doc, theme, x, y, width, metrics) {
  const gap = 6;
  const cardW = (width - gap * (metrics.length - 1)) / metrics.length;
  metrics.forEach((metric, index) => {
    const cardX = x + index * (cardW + gap);
    doc.roundedRect(cardX, y, cardW, 34, 3).fill(theme.cardBg).strokeColor(theme.border).lineWidth(0.5).stroke();
    doc.fillColor(theme.accent).font('Helvetica-Bold').fontSize(10).text(metric.value, cardX + 8, y + 8, { width: cardW - 16, ellipsis: true });
    doc.fillColor(theme.mutedText).font('Helvetica-Bold').fontSize(6).text(metric.label.toUpperCase(), cardX + 8, y + 20, { width: cardW - 16, ellipsis: true });
  });
}

function addExperienceSection(doc, resume, theme, x, width, style) {
  const items = resume.experience.length ? resume.experience : [{
    title: 'Add recent experience',
    company: 'Use this space for internships, freelance work, volunteer roles, or major projects.',
    description: 'Lead with measurable outcomes, tools used, and the value delivered.',
  }];

  addCardSection(doc, 'Experience', theme, x, width, () => {
    items.forEach((item, index) => addExperience(doc, item, theme, x + 16, width - 32, index, style));
  }, { compact: true });
}

function addEducationSection(doc, resume, theme, x, width) {
  const items = resume.education.length ? resume.education : [{
    degree: 'Add education or certifications',
    school: 'Include degrees, bootcamps, certificates, or relevant coursework.',
  }];

  addCardSection(doc, 'Education', theme, x, width, () => {
    items.forEach((item, index) => addEducation(doc, item, theme, x + 16, width - 32, index));
  }, { compact: true });
}

function addCompletionPanel(doc, resume, theme, x, width) {
  const prompts = [];
  if (!resume.summary) prompts.push('Add summary.');
  if (!resume.experience.length) prompts.push('Add experience.');
  if (!resume.education.length) prompts.push('Add education.');
  if (!resume.skills.length) prompts.push('Add skills.');
  if (prompts.length === 0) prompts.push('Keep current.');

  addPromptCard(doc, 'Checklist', prompts.slice(0, 1), theme, x, width);
}

function addCardSection(doc, title, theme, x, width, renderContent, options = {}) {
  const estimatedHeight = 120;
  if (doc.y + estimatedHeight > PAGE.height - PAGE.bottom - 40) {
    return;
  }
  
  const startY = doc.y;
  const minHeight = options.compact ? 48 : 56;
  const y = doc.y;

  doc.roundedRect(x, y, width, minHeight, 4).fill(theme.cardBg).strokeColor(theme.border).lineWidth(0.6).stroke();
  doc.fillColor(theme.accent).font('Helvetica-Bold').fontSize(options.compact ? 7.5 : 8.5).text(title.toUpperCase(), x + 10, y + 10, { width: width - 20 });
  doc.moveTo(x + 10, y + 24).lineTo(x + width - 10, y + 24).lineWidth(0.6).strokeColor(theme.border).stroke();
  doc.y = y + 30;

  renderContent();
  const contentBottom = Math.max(doc.y + 6, y + minHeight);

  if (contentBottom > y + minHeight) {
    doc.save();
    doc.roundedRect(x, y, width, contentBottom - y, 4).strokeColor(theme.border).lineWidth(0.6).stroke();
    doc.restore();
  }
  doc.y = contentBottom + (options.compact ? 5 : 7);

  if (doc.y < startY) doc.y = startY + minHeight + 6;
}

function addPromptCard(doc, title, prompts, theme, x, width) {
  const y = doc.y;
  const promptCount = Math.min(prompts.length, 1);
  const cardHeight = 32 + promptCount * 14;
  doc.roundedRect(x, y, width, cardHeight, 4).fill(theme.accentSoft).strokeColor(theme.border).lineWidth(0.5).stroke();
  doc.fillColor(theme.accentDark).font('Helvetica-Bold').fontSize(7.5).text(title.toUpperCase(), x + 10, y + 8, { width: width - 20 });
  let cursor = y + 22;
  prompts.slice(0, promptCount).forEach((prompt) => {
    doc.circle(x + 14, cursor + 2, 1.5).fill(theme.secondary);
    doc.fillColor(theme.bodyText).font('Helvetica').fontSize(7.2).text(prompt, x + 24, cursor, { width: width - 36, lineGap: 1 });
    cursor = doc.y + 2;
  });
  doc.y = Math.max(cursor + 4, y + cardHeight);
}

function addParagraph(doc, value, theme, x, width) {
  doc
    .fillColor(theme.bodyText)
    .font('Helvetica')
    .fontSize(6.8)
    .text(toText(value), x, doc.y, {
      width,
      lineGap: 0.5,
    });
}

function addExperience(doc, item, theme, x, width, index, style) {
  const title = pick(item, ['position', 'title', 'role']) || toText(item);
  const company = pick(item, ['company', 'organization', 'employer']);
  const duration = pick(item, ['duration', 'dates', 'period']);
  const description = pick(item, ['description', 'summary', 'details']);
  const markerX = x;
  const bodyX = x + 12;

  if (index > 0) {
    doc.moveDown(0.15);
    doc.moveTo(bodyX, doc.y).lineTo(x + width, doc.y).lineWidth(0.3).strokeColor(theme.border).stroke();
    doc.moveDown(0.2);
  }

  doc.circle(markerX + 2, doc.y + 4, 2.5).fill(index === 0 ? theme.secondary : theme.accentSoft);
  doc
    .fillColor(theme.bodyText)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(title, bodyX, doc.y, { width: width - 12, lineGap: 0.3 });

  const subtitle = [company, duration].filter(Boolean).join(' | ');
  if (subtitle) {
    doc
      .fillColor(theme.mutedText)
      .font('Helvetica')
      .fontSize(7)
      .text(subtitle, bodyX, doc.y + 0.5, { width: width - 12, lineGap: 0.8 });
  }

  if (description) {
    doc.moveDown(0.15);
    doc.fillColor(theme.bodyText).font('Helvetica').fontSize(7).text(toText(description).substring(0, 100), bodyX, doc.y, { width: width - 12, lineGap: 1 });
  }

  doc.moveDown(0.2);
}

function addEducation(doc, item, theme, x, width, index) {
  const degree = pick(item, ['degree', 'qualification', 'program']) || toText(item);
  const school = pick(item, ['school', 'institution', 'university']);
  const year = pick(item, ['year', 'duration', 'dates']);

  if (index > 0) doc.moveDown(0.2);
  doc.fillColor(theme.bodyText).font('Helvetica-Bold').fontSize(8).text(degree, x, doc.y, { width, lineGap: 0.3 });
  const subtitle = [school, year].filter(Boolean).join(' | ');
  if (subtitle) {
    doc.fillColor(theme.mutedText).font('Helvetica').fontSize(7).text(subtitle, x, doc.y + 0.5, { width, lineGap: 0.8 });
  }
}

function addSkills(doc, skills, theme, x, width, options = {}) {
  const gap = 5;
  const rowHeight = options.small ? 18 : 20;
  let cursorX = x;
  let cursorY = doc.y;

  skills.map(toText).filter(Boolean).forEach((skill) => {
    const tagWidth = Math.min(doc.widthOfString(skill) + 16, width);
    if (cursorX + tagWidth > x + width) {
      cursorX = x;
      cursorY += rowHeight + gap;
    }
    doc.roundedRect(cursorX, cursorY, tagWidth, rowHeight, 3).fill(theme.accentSoft);
    doc.fillColor(theme.bodyText).font('Helvetica-Bold').fontSize(options.small ? 7.5 : 8.2).text(skill, cursorX + 8, cursorY + 5, {
      width: tagWidth - 16,
      height: rowHeight,
      ellipsis: true,
    });
    cursorX += tagWidth + gap;
  });

  doc.y = cursorY + rowHeight + 4;
}

function addSmallRailText(doc, value, x, y, width, theme, muted) {
  doc
    .fillColor(muted ? '#b8ccc8' : '#ffffff')
    .font('Helvetica')
    .fontSize(8.2)
    .text(value, x, y, { width, lineGap: 2 });
}

function addFooterToAllPages(doc, theme, style) {
  const range = doc.bufferedPageRange();
  const footerRuleY = PAGE.height - 52;
  const footerTextY = PAGE.height - 43;

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.save();
    doc
      .moveTo(PAGE.margin, footerRuleY)
      .lineTo(PAGE.width - PAGE.margin, footerRuleY)
      .lineWidth(0.5)
      .strokeColor(theme.border)
      .stroke();
    doc
      .fillColor(theme.mutedText)
      .font('Helvetica')
      .fontSize(7.5)
      .text(TEMPLATE_COPY[style].footer, PAGE.margin, footerTextY, { width: 220, lineBreak: false });
    doc
      .fillColor(theme.accent)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text(`Page ${i - range.start + 1}`, PAGE.width - PAGE.margin - 64, footerTextY, {
        width: 64,
        align: 'right',
        lineBreak: false,
      });
    doc.restore();
  }
}

function ensureSpace(doc, height, theme) {
  const bottom = PAGE.height - PAGE.bottom;
  if (doc.y + height > bottom) {
    doc.addPage();
    drawPageChrome(doc, theme, 'minimal');
    doc.y = PAGE.margin + 20;
  }
}

function getInitials(name) {
  return toText(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'YN';
}

function getFocusLine(resume) {
  const topSkills = resume.skills.slice(0, 3).join(', ');
  if (topSkills && resume.experience.length) return `Current profile emphasizes ${topSkills} with ${resume.experience.length} experience entry${resume.experience.length === 1 ? '' : 'ies'}.`;
  if (topSkills) return `Current profile emphasizes ${topSkills}.`;
  if (resume.summary) return 'Profile summary is present; add skills and measurable work samples to strengthen scanning.';
  return 'Add role focus, top tools, and measurable results to complete this profile.';
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [value];
}

function pick(value, keys) {
  if (!value || typeof value !== 'object') return '';
  const found = keys.map((key) => value[key]).find(Boolean);
  return found ? toText(found) : '';
}

function toText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.values(value).map(toText).filter(Boolean).join(' ');
  return String(value).trim();
}

// Save formatted resume data
export const saveFormattedResume = async (userId, formattedData, templateStyle) => {
  try {
    await pool.query(
      `UPDATE resumes
       SET formatted_data = $1, template_style = $2, updated_at = NOW()
       WHERE id = (
         SELECT id FROM resumes
         WHERE user_id = $3
         ORDER BY uploaded_at DESC LIMIT 1
       )`,
      [JSON.stringify(formattedData), templateStyle, userId]
    );
  } catch (err) {
    console.error('Error saving formatted resume:', err);
    throw err;
  }
};
