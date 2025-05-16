import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

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
import ReportForm from './components/disciplines/environmental/daily/ReportForm';
import NewReport from './components/common/NewReport';

// Environmental Components
import EnvironmentalMain from './components/disciplines/environmental/main/EnvironmentalMain';
import EnvironmentalReports from './components/disciplines/environmental/main/EnvironmentalDashboard';
import NewPunchlistReport from './components/disciplines/environmental/punchlist/NewPunchlistReport';
import PunchlistDrafts from './components/disciplines/environmental/punchlist/PunchlistDrafts';
import PunchlistDraftView from './components/disciplines/environmental/punchlist/PunchlistDraftView';
import NewSWPPP from './components/disciplines/environmental/swppp/NewSWPPP';
import SWPPPReport from './components/disciplines/environmental/swppp/SWPPPReport';
import SWPPPPhotoPage from './components/disciplines/environmental/swppp/SWPPPPhotoPage';
import SWPPPDrafts from './components/disciplines/environmental/swppp/SWPPPDrafts';
import NewProgressReport from './components/disciplines/environmental/progress/NewProgressReport';
import NewVarianceReport from './components/disciplines/environmental/variance/NewVarianceReport';

// Welding Components
import WeldingMain from './components/disciplines/welding/main/WeldingMain';
import DailyWeldingReportForm from './components/disciplines/welding/daily/DailyWeldingReportForm';
import WeldingReports from './components/disciplines/welding/daily/WeldingReports';
import WeldingDraftReports from './components/disciplines/welding/daily/WeldingDraftReports';

// Coating Components
import CoatingMain from './components/disciplines/coating/main/CoatingMain';
import CoatingRoutes from './routes/coatingRoutes';

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
      default: '#f5f5f5',
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Navigation />
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
            path="/environmental/reports/daily/new"
            element={
              <PrivateRoute>
                <ReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding"
            element={
              <PrivateRoute>
                <WeldingMain />
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
            path="/welding/reports"
            element={
              <PrivateRoute>
                <WeldingReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/welding/reports/drafts"
            element={
              <PrivateRoute>
                <WeldingDraftReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/project-documents"
            element={
              <PrivateRoute>
                <ProjectDocuments />
              </PrivateRoute>
            }
          />
          <Route
            path="/variance/new"
            element={
              <PrivateRoute>
                <NewVarianceReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-report/*"
            element={
              <PrivateRoute>
                <ReportForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-punchlist"
            element={
              <PrivateRoute>
                <NewPunchlistReport />
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
            path="/photos"
            element={
              <PrivateRoute>
                <PhotosPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/review-report/:id"
            element={
              <PrivateRoute>
                <ReviewReport />
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
          <Route
            path="/punchlist-report/:id"
            element={
              <PrivateRoute>
                <NewPunchlistReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/swppp/new"
            element={
              <PrivateRoute>
                <NewSWPPP />
              </PrivateRoute>
            }
          />
          <Route
            path="/swppp-report/:reportId"
            element={
              <PrivateRoute>
                <SWPPPReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/swppp-report/:reportId/photos"
            element={
              <PrivateRoute>
                <SWPPPPhotoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-progress-report"
            element={
              <PrivateRoute>
                <NewProgressReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating"
            element={
              <PrivateRoute>
                <CoatingMain />
              </PrivateRoute>
            }
          />
          <Route
            path="/coating/*"
            element={
              <PrivateRoute>
                <CoatingRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path="/swppp-drafts"
            element={
              <PrivateRoute>
                <SWPPPDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/punchlist-drafts"
            element={
              <PrivateRoute>
                <PunchlistDrafts />
              </PrivateRoute>
            }
          />
          <Route
            path="/punchlist-draft/:draftId"
            element={
              <PrivateRoute>
                <PunchlistDraftView />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
