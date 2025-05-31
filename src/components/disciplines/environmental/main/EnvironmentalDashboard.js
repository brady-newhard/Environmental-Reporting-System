import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDraftCount } from '../../../../utils/draftUtils';

const EnvironmentalDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const [swpppDraftCount, setSwpppDraftCount] = useState(0);
  const [dailyDraftCount, setDailyDraftCount] = useState(0);
  const [punchlistDraftCount, setPunchlistDraftCount] = useState(0);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const loadDraftCounts = async () => {
        try {
          setSwpppDraftCount(await getDraftCount('swppp'));
          setDailyDraftCount(await getDraftCount('environmental'));
          setPunchlistDraftCount(await getDraftCount('punchlist'));
        } catch (error) {
          console.error('Error loading draft counts:', error);
        }
      };
      loadDraftCounts();
    }
  }, [loading, isAuthenticated]);

  return (
    <div>
      {/* Your existing JSX here */}
    </div>
  );
};

export default EnvironmentalDashboard; 