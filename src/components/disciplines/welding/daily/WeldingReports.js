import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDraftCount } from '../../../utils/draftUtils';

const WeldingReports = ({ secondaryAction, reportType }) => {
  const { isAuthenticated, loading } = useAuth();
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    if (secondaryAction && reportType && !loading && isAuthenticated) {
      getDraftCount(reportType)
        .then(setDraftCount)
        .catch(error => {
          console.error('Error loading draft count:', error);
        });
    }
  }, [secondaryAction, reportType, loading, isAuthenticated]);

  return (
    <div>
      {/* Your existing JSX here */}
    </div>
  );
};

export default WeldingReports; 