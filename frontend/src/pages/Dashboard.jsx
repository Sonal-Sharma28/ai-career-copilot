import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('http://localhost:5000/api/resume', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setResume(data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching resume', error);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setResume(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto mt-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name}!</h1>

      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Resume Upload</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 w-max"
          >
            {loading ? 'Uploading & Parsing...' : 'Upload Resume'}
          </button>
        </form>
      </div>

      {resume && (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Your Resume Data</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-700">Skills</h3>
            {resume.skills && resume.skills.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {resume.skills.map((skill, index) => (
                  <li key={index} className="text-gray-600">{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No skills found.</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-700">Education</h3>
            {resume.education && resume.education.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {resume.education.map((edu, index) => (
                  <li key={index} className="text-gray-600">{edu}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No education found.</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-700">Experience</h3>
            {resume.experience && resume.experience.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {resume.experience.map((exp, index) => (
                  <li key={index} className="text-gray-600">{exp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No experience found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
