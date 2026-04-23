import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container p-4 mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
      <p className="mt-4 text-gray-600">This is your AI Career Copilot Dashboard.</p>
    </div>
  );
};

export default Dashboard;
