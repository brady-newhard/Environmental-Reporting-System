import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDraftCount } from '../../../../utils/draftUtils';

const UtilityReports = () => {
  const { isAuthenticated, loading } = useAuth();
  const [payloadDraftCount, setPayloadDraftCount] = useState(0);
  const [i3DraftCount, setI3DraftCount] = useState(0);

  useEffect(() => {
    const loadDraftCounts = async () => {
      try {
        setPayloadDraftCount(await getDraftCount('utility'));
        setI3DraftCount(await getDraftCount('i3_utility'));
      } catch (error) {
        console.error('Error loading draft counts:', error);
      }
    };
    if (!loading && isAuthenticated) {
      loadDraftCounts();
    }
  }, [loading, isAuthenticated]);

  return (
    <div>
      {/* Your existing JSX here */}
    </div>
  );
};

export default UtilityReports; 