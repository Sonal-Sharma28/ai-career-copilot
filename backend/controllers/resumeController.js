import Resume from '../models/Resume.js';
import pdfParse from 'pdf-parse';

// Simple heuristic parser, AI will be used later
const parseResumeText = (text) => {
  const lines = text.split('\n');
  const skills = [];
  const education = [];
  const experience = [];
  
  let currentSection = '';

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('skills')) currentSection = 'skills';
    else if (lowerLine.includes('education')) currentSection = 'education';
    else if (lowerLine.includes('experience')) currentSection = 'experience';
    else if (line.trim().length > 0) {
      if (currentSection === 'skills') skills.push(line.trim());
      if (currentSection === 'education') education.push(line.trim());
      if (currentSection === 'experience') experience.push(line.trim());
    }
  });

  return { skills, education, experience };
};

// @desc    Upload & Parse Resume
// @route   POST /api/resume/upload
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const dataBuffer = req.file.buffer;
    const data = await pdfParse(dataBuffer);
    
    const { skills, education, experience } = parseResumeText(data.text);

    let resume = await Resume.findOne({ user: req.user._id });
    if (resume) {
      resume.rawText = data.text;
      resume.skills = skills;
      resume.education = education;
      resume.experience = experience;
      await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user._id,
        rawText: data.text,
        skills,
        education,
        experience
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user resume
// @route   GET /api/resume
// @access  Private
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (resume) {
      res.json(resume);
    } else {
      res.status(404).json({ message: 'Resume not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
