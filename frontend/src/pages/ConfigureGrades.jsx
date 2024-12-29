import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const ConfigureGrades = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gradeName, setGradeName] = useState('');
  const [streams, setStreams] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/settings/configure-grades');
      setGrades(response.data.grades);
    } catch (error) {
      setError('Failed to fetch grades. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradeName.trim()) {
      setError('Grade name is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/settings/configure-grades', {
        grades: [{ name: gradeName.trim(), streams: [] }]
      });

      if (response.data) {
        await fetchGrades();
        setGradeName('');
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create grade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || !streams.trim()) {
      setError('Both grade and streams are required');
      return;
    }

    try {
      setIsLoading(true);
      const streamNames = streams.split(',')
        .map(stream => stream.trim())
        .filter(stream => stream !== '');

      const gradeToUpdate = grades.find(grade => grade.name === selectedGrade);
      
      const response = await axiosInstance.post('/settings/configure-grades', {
        grades: [{
          name: gradeToUpdate.name,
          streams: [...new Set([...gradeToUpdate.streams.map(s => s.name), ...streamNames])]
        }]
      });

      if (response.data) {
        await fetchGrades();
        setStreams('');
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add streams');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Grade Configuration</h1>
        <p className="text-gray-600 mt-1">Manage your school's grades and streams</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add New Grade</h2>
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter grade name"
                value={gradeName}
                onChange={(e) => setGradeName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Grade'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add Streams</h2>
          <form onSubmit={handleStreamSubmit} className="space-y-4">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.name}>
                  {grade.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Enter streams (comma-separated)"
              value={streams}
              onChange={(e) => setStreams(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Streams'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Existing Grades and Streams</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No grades configured yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grades.map((grade) => (
              <div 
                key={grade.id} 
                className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{grade.name}</h3>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {grade.streams.length} {grade.streams.length === 1 ? 'stream' : 'streams'}
                  </span>
                </div>
                
                <div className="relative">
                  {grade.streams.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {grade.streams.map((stream) => (
                        <div
                          key={stream.id}
                          className="group relative"
                        >
                          <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors">
                            {stream.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No streams configured</p>
                  )}
                </div>
                
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureGrades;