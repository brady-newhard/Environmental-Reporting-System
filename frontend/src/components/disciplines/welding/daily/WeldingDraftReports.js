import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../common/PageHeader';
import Footer from '../../../common/Footer';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';

const WeldingDraftReports = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const loadDrafts = async () => {
      const drafts = await getAllDrafts('welding');
      setDrafts(drafts.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0)));
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
      await deleteDraft('welding', draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Draft Welding Reports</span>}
          backPath="/welding/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="bg-gray-800/40 backdrop-blur rounded-lg shadow border border-gray-700 overflow-hidden">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => handleResume(draft.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => navigate(`/welding/reports/daily/review/${draft.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDelete(draft.id)}
                        >
                          <Delete className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeldingDraftReports; 