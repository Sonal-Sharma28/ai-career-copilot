import OpenAI from 'openai';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Get match score between resume and job
// @route   POST /api/ai/match/:jobId
// @access  Private
export const getMatchScore = async (req, res) => {
  try {
    const { jobId } = req.params;

    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const prompt = `
      You are an expert technical recruiter. I will provide you with a job description and a candidate's resume.
      Your task is to analyze them and provide a match score out of 100, along with a brief explanation (max 3 sentences) of why they match or don't match.
      
      Job Description:
      ${job.title} at ${job.company}
      ${job.description}
      
      Candidate's Resume:
      ${resume.rawText}
      
      Format your response exactly as follows:
      Score: [Number]
      Reasoning: [Your brief explanation]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.5,
    });

    const output = response.choices[0].message.content.trim();
    // Parse the output
    const scoreMatch = output.match(/Score:\s*(\d+)/i);
    const reasoningMatch = output.match(/Reasoning:\s*(.+)/is);

    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : output;

    res.status(200).json({ score, reasoning });
  } catch (error) {
    console.error('Error getting match score:', error);
    res.status(500).json({ message: error.message || 'Failed to generate match score' });
  }
};

// @desc    Optimize resume for a specific job
// @route   POST /api/ai/optimize/:jobId
// @access  Private
export const optimizeResume = async (req, res) => {
  try {
    const { jobId } = req.params;

    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const prompt = `
      You are an expert career coach. I will provide you with a job description and a candidate's current resume.
      Your task is to suggest 3-5 optimized bullet points that the candidate should add or modify in their resume to better match this specific job description. 
      Only provide the actionable bullet points.
      
      Job Description:
      ${job.title} at ${job.company}
      ${job.description}
      
      Candidate's Resume:
      ${resume.rawText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const suggestions = response.choices[0].message.content.trim();
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error optimizing resume:', error);
    res.status(500).json({ message: error.message || 'Failed to optimize resume' });
  }
};

// @desc    Generate a cover letter for a specific job
// @route   POST /api/ai/cover-letter/:jobId
// @access  Private
export const generateCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.params;

    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const prompt = `
      You are an expert career coach and professional writer. I will provide you with a job description and a candidate's resume.
      Your task is to write a compelling, professional cover letter for this candidate applying for this specific job.
      Keep it concise (3-4 paragraphs) and highlight the candidate's most relevant skills from their resume.
      Do not include placeholder brackets like [Your Name] if the information is available, but if it's missing, use placeholders.
      
      Job Description:
      ${job.title} at ${job.company}
      ${job.description}
      
      Candidate's Resume:
      ${resume.rawText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const coverLetter = response.choices[0].message.content.trim();
    res.status(200).json({ coverLetter });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ message: error.message || 'Failed to generate cover letter' });
  }
};
