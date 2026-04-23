import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapeMessage, setScrapeMessage] = useState('');

  const fetchJobs = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
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
        headers: { Authorization: `Bearer ${userInfo.token}` },
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
        <h1 className="text-3xl font-bold text-gray-800">Job Listings</h1>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {loading ? 'Scraping...' : 'Scrape Jobs'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {scrapeMessage && <p className="text-green-600 mb-4 font-semibold">{scrapeMessage}</p>}

      {jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h2>
                <p className="text-md text-gray-600 mb-4 font-semibold">{job.company}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{job.description}</p>
              </div>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 self-start"
              >
                View Job
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">No jobs found. Try scraping!</p>
      )}
    </div>
  );
};

export default Jobs;
