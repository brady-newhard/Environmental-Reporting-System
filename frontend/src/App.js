// import 'antd/dist/reset.css';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { syncDrafts, migrateLocalStorageDrafts, clearOtherUserDrafts } from './utils/draftUtils';

// Common Components
import HomePage from './components/common/HomePage';
import SearchReports from './components/common/SearchReports';
import SignIn from './components/common/SignIn';
import SignUp from './components/common/SignUp';
import SuccessSignUp from './components/common/SuccessSignUp';
import ContactList from './components/common/ContactList';
import Navigation from './components/common/Navigation';
import ProjectDocuments from './components/common/ProjectDocuments';
import PhotosPage from './components/common/PhotosPage';
import ReviewReport from './components/common/ReviewReport';
import PrivateRoute from './components/common/PrivateRoute';
import Profile from './components/common/Profile';
import NewReport from './components/common/NewReport';

// Environmental Components
import EnvironmentalMain from './components/disciplines/environmental/main/EnvironmentalMain';
import EnvironmentalReports from './components/disciplines/environmental/main/EnvironmentalDashboard';
import PunchlistDrafts from './components/disciplines/environmental/punchlists/PunchlistDrafts';
import PunchlistReport from './components/disciplines/environmental/punchlists/PunchlistReport';
import PunchlistReportReview from './components/disciplines/environmental/punchlists/PunchlistReportReview';
import PunchlistReportSubmitted from './components/disciplines/environmental/punchlists/PunchlistReportSubmitted';
import PunchlistReportEditSubmitted from './components/disciplines/environmental/punchlists/PunchlistReportEditSubmitted';
import PunchlistReportPrint from './components/disciplines/environmental/punchlists/PunchlistReportPrint';
// import NewSWPPP from './components/disciplines/environmental/swppp/NewSWPPP';
import SWPPPReport from './components/disciplines/environmental/swppp/SWPPPReport';
import SWPPPReportForm from './components/disciplines/environmental/swppp/SWPPPReportForm';
import SWPPPPhotoPage from './components/disciplines/environmental/swppp/SWPPPPhotoPage';
import SWPPPDrafts from './components/disciplines/environmental/swppp/SWPPPDrafts';
import NewProgressReport from './components/disciplines/environmental/progress/NewProgressReport';
import NewVarianceReport from './components/disciplines/environmental/variance/NewVarianceReport';
import EnvironmentalDailyReport from './components/disciplines/environmental/daily/EnvironmentalDailyReport';
import EnvironmentalDailyReportReview from './components/disciplines/environmental/daily/EnvironmentalDailyReportReview';
import EnvironmentalDailyReportDrafts from './components/disciplines/environmental/daily/EnvironmentalDailyReportDrafts';
import EnvironmentalDailyReportForm from './components/disciplines/environmental/daily/EnvironmentalDailyReportForm';
import EnvironmentalDailyReportSubmitted from './components/disciplines/environmental/daily/EnvironmentalDailyReportSubmitted';
import EnvironmentalDailyReportEditSubmitted from './components/disciplines/environmental/daily/EnvironmentalDailyReportEditSubmitted';
import SWPPPReportReview from './components/disciplines/environmental/swppp/SWPPPReportReview';
import SWPPPReportSubmitted from './components/disciplines/environmental/swppp/SWPPPReportSubmitted';
import SWPPPReportEditSubmitted from './components/disciplines/environmental/swppp/SWPPPReportEditSubmitted';
import EnvironmentalDailyReportPrint from './components/disciplines/environmental/daily/EnvironmentalDailyReportPrint';
import SWPPPReportPrint from './components/disciplines/environmental/swppp/SWPPPReportPrint';

// Welding Components
import WeldingMain from './components/disciplines/welding/main/WeldingMain';
import DailyWeldingReportForm from './components/disciplines/welding/daily/DailyWeldingReportForm';
import WeldingReports from './components/disciplines/welding/daily/WeldingReports';
import DailyWeldingReportDrafts from './components/disciplines/welding/daily/DailyWeldingReportDrafts';
import DailyWeldingReportStationDrafts from './components/disciplines/welding/daily/DailyWeldingReportStationDrafts';
import DailyWeldingReportReview from './components/disciplines/welding/daily/DailyWeldingReportReview';
import DailyWeldingReportStationReview from './components/disciplines/welding/daily/DailyWeldingReportStationReview';
import DailyWeldingReportStationForm from './components/disciplines/welding/daily/DailyWeldingReportStationForm';

// Coating Components
import CoatingMain from './components/disciplines/coating/main/CoatingMain';
import CoatingRoutes from './routes/coatingRoutes';
import CoatingReports from './components/disciplines/coating/daily/CoatingReports';
import CoatingDailyReports from './components/disciplines/coating/daily/CoatingDailyReports';
import CoatingDraftReports from './components/disciplines/coating/daily/CoatingDraftReports';
import CoatingDailyReportForm from './components/disciplines/coating/daily/CoatingDailyReportForm';
import CoatingInspectionReportForm from './components/disciplines/coating/oversight/CoatingInspectionReportForm';
import CoatingInspectionReportPrint from './components/disciplines/coating/oversight/CoatingInspectionReportPrint';

// Utility Components
import UtilityDashboard from './components/disciplines/utility/main/UtilityDashboard';
import UtilityReports from './components/disciplines/utility/main/UtilityReports';
import DailyUtilityReportForm from './components/templates/disciplines/utility/DailyUtilityReportForm';
import DailyUtilityReportReview from './components/disciplines/utility/daily/DailyUtilityReportReview';
import DailyUtilityReportDrafts from './components/disciplines/utility/daily/DailyUtilityReportDrafts';
import DailyUtilityReportPrint from './components/disciplines/utility/daily/DailyUtilityReportPrint';
import PayItemReportForm from './components/templates/disciplines/utility/PayItemReportForm';
import PayItemReportDrafts from './components/disciplines/utility/daily/PayItemReportDrafts';
import PayItemReportReview from './components/disciplines/utility/daily/PayItemReportReview';
import PayItemReportPrint from './components/disciplines/utility/daily/PayItemReportPrint';
import DailyUtilityReport2Form from './components/templates/disciplines/utility/DailyUtilityReport2Form';
import DailyUtilityReport2Drafts from './components/disciplines/utility/daily/DailyUtilityReport2Drafts';
import DailyUtilityReport2Review from './components/disciplines/utility/daily/DailyUtilityReport2Review';
import DailyUtilityReport2Print from './components/disciplines/utility/daily/DailyUtilityReport2Print';

// Lead Components
import LeadDashboard from './components/leads/LeadDashboard';
import ReportReview from './components/leads/ReportReview';
import LeadEditUtilityDaily2 from './components/leads/LeadEditUtilityDaily2';
import LeadEditEnvironmentalDaily from './components/leads/LeadEditEnvironmentalDaily';
import LeadEditSWPPP from './components/leads/LeadEditSWPPP';
import LeadEditPunchlist from './components/leads/LeadEditPunchlist';
import LeadEditPayItem from './components/leads/LeadEditPayItem';
import LeadEditUtilityDaily from './components/leads/LeadEditUtilityDaily';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
      color: '#000000',
    },
    h6: {
      fontWeight: 600,
      color: '#000000',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#000000',
            },
            '&:hover fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderBottom: '1px solid #000000',
          '& .MuiTypography-root': {
            color: '#ffffff',
          },
          '& .MuiIconButton-root': {
            color: '#ffffff',
          },
          '& .MuiSelect-select': {
            color: '#ffffff',
          },
          '& .MuiSelect-icon': {
            color: '#ffffff',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffff',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #000000',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#000000',
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: '#000000',
        },
      },
    },
  },
});

function AppContent() {
  const { isAuthenticated, loading, toggleDevAutoSignIn, setDevUser } = useAuth();
  const location = useLocation();

  // Hide Navigation on login and signup pages
  const hideNav = location.pathname === '/login' || location.pathname === '/signup';

  console.log('[App] AppContent rendered - Auth:', isAuthenticated, 'Loading:', loading);
  console.log('[App] Current path:', location.pathname, 'Hide nav:', hideNav);

  // Run migration once when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    
    const runMigration = async () => {
      try {
        console.log('Running draft migration for authenticated user...');
        
        // First clear any drafts from other users
        const clearedCount = await clearOtherUserDrafts();
        if (clearedCount > 0) {
          console.log(`Cleared ${clearedCount} drafts from other users`);
        }
        
        // Then migrate localStorage drafts for current user
        const migratedCount = await migrateLocalStorageDrafts();
        if (migratedCount > 0) {
          console.log(`Successfully migrated ${migratedCount} drafts from localStorage to IndexedDB`);
        }
      } catch (error) {
        console.error('Error during migration:', error);
      }
    };
    
    runMigration();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="app-shell" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Development helper - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="print:hidden" style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          backgroundColor: '#000',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <div onClick={toggleDevAutoSignIn} style={{ cursor: 'pointer', marginBottom: '4px' }}>
            {localStorage.getItem('devAutoSignIn') === 'true' ? '🔓 Dev Mode ON' : '🔒 Dev Mode OFF'}
          </div>
          {localStorage.getItem('devAutoSignIn') === 'true' && (
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              <span onClick={() => setDevUser('brady-newhard')} style={{ cursor: 'pointer', marginRight: '8px' }}>
                Brady
              </span>
              <span onClick={() => setDevUser('bob-yeo')} style={{ cursor: 'pointer', marginRight: '8px' }}>
                Bob
              </span>
              <span onClick={() => setDevUser('Environmental-Lead')} style={{ cursor: 'pointer', marginRight: '8px' }}>
                Env Lead
              </span>
              <span onClick={() => logout()} style={{ cursor: 'pointer', color: '#ff6b6b' }}>
                Logout
              </span>
            </div>
          )}
        </div>
      )}
      
      {!hideNav && <Navigation />}
      <main className="main-content print:pt-0">
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/success-signup" element={<SuccessSignUp />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          {/* Environmental Routes */}
          <Route
            path="/environmental"
            element={
              <PrivateRoute>
                <EnvironmentalMain />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports"
            element={
              <PrivateRoute>
                <EnvironmentalReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/dashboard"
            element={
              <PrivateRoute>
                <EnvironmentalReports />
              </PrivateRoute>
            }
          />
          {/* Environmental Daily Reports */}
          <Route
            path="/environmental/reports/daily/new"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/edit/:id"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/drafts"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/review/:id"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/print/:id"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportPrint />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/submitted"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportSubmitted />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/daily/edit-submitted/:reportId"
            element={
              <PrivateRoute>
                <EnvironmentalDailyReportEditSubmitted />
              </PrivateRoute>
            }
          />
          {/* SWPPP Reports */}
          <Route
            path="/environmental/swppp/new"
            element={
              <PrivateRoute>
                <SWPPPReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/swppp/drafts"
            element={
              <PrivateRoute>
                <SWPPPDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/swppp/review/:id"
            element={
              <PrivateRoute>
                <SWPPPReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/swppp/edit/:id"
            element={
              <PrivateRoute>
                <SWPPPReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/swppp/print/:id"
            element={
              <PrivateRoute>
                <SWPPPReportPrint />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/swppp/submitted"
            element={
              <PrivateRoute>
                <SWPPPReportSubmitted />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/swppp/edit-submitted/:reportId"
            element={
              <PrivateRoute>
                <SWPPPReportEditSubmitted />
              </PrivateRoute>
            }
          />
          {/* Punchlist Reports */}
          <Route
            path="/environmental/reports/punchlist/new"
            element={
              <PrivateRoute>
                <PunchlistReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/drafts"
            element={
              <PrivateRoute>
                <PunchlistDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/review/:id"
            element={
              <PrivateRoute>
                <PunchlistReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/edit/:id"
            element={
              <PrivateRoute>
                <PunchlistReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/print/:id"
            element={
              <PrivateRoute>
                <PunchlistReportPrint />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/submitted"
            element={
              <PrivateRoute>
                <PunchlistReportSubmitted />
              </PrivateRoute>
            }
          />
          <Route
            path="/environmental/reports/punchlist/edit-submitted/:reportId"
            element={
              <PrivateRoute>
                <PunchlistReportEditSubmitted />
              </PrivateRoute>
            }
          />
          {/* Progress Reports */}
          <Route
            path="/new-progress-report"
            element={
              <PrivateRoute>
                <NewProgressReport />
              </PrivateRoute>
            }
          />
          {/* Variance Reports */}
          <Route
            path="/variance/new"
            element={
              <PrivateRoute>
                <NewVarianceReport />
              </PrivateRoute>
            }
          />
          {/* Welding Routes */}
          <Route
            path="/welding"
            element={
              <PrivateRoute>
                <WeldingMain />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding/reports"
            element={
              <PrivateRoute>
                <WeldingReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding/reports/daily"
            element={
              <PrivateRoute>
                <DailyWeldingReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding/reports/daily/drafts"
            element={
              <PrivateRoute>
                <DailyWeldingReportDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding/reports/daily/review/:id"
            element={
              <PrivateRoute>
                <DailyWeldingReportReview />
              </PrivateRoute>
            }
          />
          {/* Coating Routes */}
          <Route
            path="/coating"
            element={
              <PrivateRoute>
                <CoatingMain />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports"
            element={
              <PrivateRoute>
                <CoatingReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/daily"
            element={
              <PrivateRoute>
                <CoatingDailyReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/daily/new"
            element={
              <PrivateRoute>
                <CoatingDailyReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/drafts"
            element={
              <PrivateRoute>
                <CoatingDraftReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/inspection"
            element={
              <PrivateRoute>
                <CoatingInspectionReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports"
            element={
              <PrivateRoute>
                <CoatingReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/daily/new"
            element={
              <PrivateRoute>
                <CoatingDailyReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/daily/drafts"
            element={
              <PrivateRoute>
                <CoatingDraftReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/reports/daily/review/:id"
            element={
              <PrivateRoute>
                <CoatingInspectionReportForm />
              </PrivateRoute>
            }
          />
          {/* Utility Routes */}
          <Route path="/utility" element={<UtilityDashboard />} />
          <Route path="/utility/reports" element={<UtilityReports />} />

          {/* Lead Dashboard Routes */}
          <Route
            path="/leads/dashboard"
            element={
              <PrivateRoute>
                <LeadDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Daily Utility Report Routes */}
          <Route
            path="/utility/reports/daily/new"
            element={
              <PrivateRoute>
                <DailyUtilityReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily/edit/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily/drafts"
            element={
              <PrivateRoute>
                <DailyUtilityReportDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily/review/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily/print/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReportPrint />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily2/new"
            element={
              <PrivateRoute>
                <DailyUtilityReport2Form />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily2/edit/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReport2Form />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily2/review/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReport2Review />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily2/print/:id"
            element={
              <PrivateRoute>
                <DailyUtilityReport2Print />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/daily2/drafts"
            element={
              <PrivateRoute>
                <DailyUtilityReport2Drafts />
              </PrivateRoute>
            }
          />
          
          {/* Pay Item Report Routes */}
          <Route
            path="/utility/reports/pay-item/new"
            element={
              <PrivateRoute>
                <PayItemReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/pay-item/edit/:id"
            element={
              <PrivateRoute>
                <PayItemReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/pay-item/drafts"
            element={
              <PrivateRoute>
                <PayItemReportDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/pay-item/review/:id"
            element={
              <PrivateRoute>
                <PayItemReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility/reports/pay-item/print/:id"
            element={
              <PrivateRoute>
                <PayItemReportPrint />
              </PrivateRoute>
            }
          />
          
          {/* Lead Routes */}
          <Route
            path="/leads/dashboard"
            element={
              <PrivateRoute>
                <LeadDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/review/:reportId"
            element={
              <PrivateRoute>
                <ReportReview />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/utility/daily2/:reportId"
            element={
              <PrivateRoute>
                <LeadEditUtilityDaily2 />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/environmental/daily/:reportId"
            element={
              <PrivateRoute>
                <LeadEditEnvironmentalDaily />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/environmental/swppp/:reportId"
            element={
              <PrivateRoute>
                <LeadEditSWPPP />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/environmental/punchlist/:reportId"
            element={
              <PrivateRoute>
                <LeadEditPunchlist />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/utility/pay-item/:reportId"
            element={
              <PrivateRoute>
                <LeadEditPayItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/edit/utility/daily/:reportId"
            element={
              <PrivateRoute>
                <LeadEditUtilityDaily />
              </PrivateRoute>
            }
          />
          
          {/* General Routes */}
          <Route
            path="/project-documents"
            element={
              <PrivateRoute>
                <ProjectDocuments />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <SearchReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <PrivateRoute>
                <ContactList />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


