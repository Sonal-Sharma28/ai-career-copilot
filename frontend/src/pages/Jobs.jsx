import { useState, useEffect } from 'react';
import axios from 'axios';

const JobCard = ({ job }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [coverLetterData, setCoverLetterData] = useState(null);
  const [aiError, setAiError] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: { Authorization: `Bearer ${userInfo?.token}` },
  };

  const handleMatchScore = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/ai/match/${job._id}`, {}, config);
      setMatchData(data);
    } catch (error) {
      setAiError(error.response?.data?.message || 'Failed to get match score.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptimizeResume = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/ai/optimize/${job._id}`, {}, config);
      setOptimizationData(data);
    } catch (error) {
      setAiError(error.response?.data?.message || 'Failed to optimize resume.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/ai/cover-letter/${job._id}`, {}, config);
      setCoverLetterData(data);
    } catch (error) {
      setAiError(error.response?.data?.message || 'Failed to generate cover letter.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md border border-gray-100 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h2>
        <p className="text-md text-gray-600 mb-4 font-semibold">{job.company}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-3">{job.description}</p>
      </div>
      <a
        href={job.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline mt-2 self-start mb-4"
      >
        View Job Application
      </a>

      {/* AI Actions */}
      <div className="flex flex-wrap gap-2 mt-auto border-t pt-4">
        <button
          onClick={handleMatchScore}
          disabled={aiLoading}
          className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >
          Match Score
        </button>
        <button
          onClick={handleOptimizeResume}
          disabled={aiLoading}
          className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >
          Optimize Resume
        </button>
        <button
          onClick={handleGenerateCoverLetter}
          disabled={aiLoading}
          className="text-xs bg-pink-50 text-pink-600 hover:bg-pink-100 px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >
          Cover Letter
        </button>
      </div>

      {aiError && <p className="text-red-500 text-xs mt-3">{aiError}</p>}

      {/* AI Results */}
      <div className="mt-4 space-y-3">
        {matchData && (
          <div className="bg-indigo-50 p-3 rounded text-sm">
            <h4 className="font-bold text-indigo-800">Match Score: {matchData.score}/100</h4>
            <p className="text-indigo-700 mt-1">{matchData.reasoning}</p>
          </div>
        )}
        
        {optimizationData && (
          <div className="bg-purple-50 p-3 rounded text-sm">
            <h4 className="font-bold text-purple-800 mb-2">Resume Optimization Suggestions</h4>
            <div className="text-purple-700 whitespace-pre-wrap">{optimizationData.suggestions}</div>
          </div>
        )}

        {coverLetterData && (
          <div className="bg-pink-50 p-3 rounded text-sm">
            <h4 className="font-bold text-pink-800 mb-2">Generated Cover Letter</h4>
            <div className="text-pink-700 whitespace-pre-wrap h-40 overflow-y-auto">{coverLetterData.coverLetter}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapeMessage, setScrapeMessage] = useState('');

  const fetchJobs = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch jobs.');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    setError('');
    setScrapeMessage('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.post('http://localhost:5000/api/jobs/scrape', {}, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setScrapeMessage(data.message);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scrape jobs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto mt-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Job Listings & AI Copilot</h1>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
        >
          {loading ? 'Scraping Latest Jobs...' : 'Scrape Jobs'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {scrapeMessage && <p className="text-green-600 mb-4 font-semibold">{scrapeMessage}</p>}

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">No jobs found. Try scraping to find the latest opportunities!</p>
      )}
    </div>
  );
};

export default Jobs;
