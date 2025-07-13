import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const WeldingDraftReports = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const loadDrafts = async () => {
      // For now, just set empty array to avoid API calls that might fail
      setDrafts([]);
    };
    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  const handleResume = (draftId) => {
    localStorage.setItem('welding_current_draftId', draftId);
    navigate('/welding/reports/daily');
  };

  const handleDelete = async (draftId) => {
    if (window.confirm('Delete this draft?')) {
      setDrafts(drafts.filter(d => d.id !== draftId));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
              <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Draft Welding Reports</h1>
        </div>
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-white font-semibold">Project</th>
                  <th className="text-left p-4 text-white font-semibold">Work Date</th>
                  <th className="text-left p-4 text-white font-semibold">Saved At</th>
                  <th className="text-left p-4 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="border-b border-gray-700 last:border-0">
                    <td className="p-4 text-white/80">{draft.project}</td>
                    <td className="p-4 text-white/80">{new Date(draft.workDate).toLocaleDateString()}</td>
                    <td className="p-4 text-white/80">{new Date(draft.lastModified).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded"
                          onClick={() => handleResume(draft.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded"
                          onClick={() => navigate(`/welding/reports/daily/review/${draft.id}`)}
                        >
                          👁️
                        </button>
                        <button
                          className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 p-2 rounded"
                          onClick={() => handleDelete(draft.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="w-full text-center py-4 text-white/80 text-sm relative z-20">
        &copy; {new Date().getFullYear()} WildStone Solutions, LLC
      </footer>
    </div>
  );
};

export default WeldingDraftReports; 