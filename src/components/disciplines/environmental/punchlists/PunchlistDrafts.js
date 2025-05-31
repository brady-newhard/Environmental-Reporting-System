import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getAllDrafts } from '../../../../utils/draftUtils';

const PunchlistDrafts = () => {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const drafts = await getAllDrafts('punchlist');
        setDrafts(drafts.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0)));
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  return (
    <div>
      {/* Your existing JSX here */}
    </div>
  );
};

export default PunchlistDrafts; 