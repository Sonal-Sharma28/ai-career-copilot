import Job from '../models/Job.js';
import puppeteer from 'puppeteer';

// @desc    Scrape jobs
// @route   POST /api/jobs/scrape
// @access  Private
export const scrapeJobs = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com/jobs', { waitUntil: 'networkidle2' });

    const jobsData = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.titleline > a');
      const jobs = [];
      jobElements.forEach((el) => {
        const text = el.innerText;
        // Basic heuristic for HN jobs: "Company is hiring Role"
        let company = 'Unknown';
        let title = text;
        if (text.includes(' is hiring ')) {
          const parts = text.split(' is hiring ');
          company = parts[0];
          title = parts[1];
        } else if (text.includes(' (')) {
            company = text.split(' (')[0];
        }

        jobs.push({
          title: title.trim(),
          company: company.trim(),
          description: text,
          link: el.href,
        });
      });
      return jobs;
    });

    await browser.close();

    const savedJobs = [];
    for (const job of jobsData) {
      const exists = await Job.findOne({ link: job.link });
      if (!exists) {
        const newJob = await Job.create(job);
        savedJobs.push(newJob);
      }
    }

    res.status(200).json({ message: `Scraped and added ${savedJobs.length} new jobs.`, jobs: savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
