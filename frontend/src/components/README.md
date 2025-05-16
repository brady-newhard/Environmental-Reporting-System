# Frontend Component Structure

## Overview
The frontend components are organized to match the backend structure, with each inspection discipline having its own dedicated folder and subfolders for different report types.

## Directory Structure

```
components/
├── disciplines/                    # All inspection-related components
│   ├── environmental/             # Environmental inspection components
│   │   ├── punchlist/            # Punchlist report components
│   │   │   ├── NewPunchlistReport.js
│   │   │   ├── PunchlistReportPage.js
│   │   │   └── PunchlistDraftView.js
│   │   └── swppp/                # SWPPP report components
│   │       ├── NewSWPPP.js
│   │       ├── SWPPPDrafts.js
│   │       ├── SWPPPReport.js
│   │       └── SWPPPPhotoPage.js
│   ├── coating/                   # Coating inspection components
│   │   ├── daily/                # Daily coating reports
│   │   └── oversight/            # Oversight items
│   ├── welding/                   # Welding inspection components
│   │   ├── daily/                # Daily welding reports
│   │   └── photos/               # Welding photo components
│   └── utility/                   # Utility inspection components
│       ├── daily/                # Daily utility reports
│       └── photos/               # Utility photo components
├── common/                        # Shared components
│   ├── Navigation.js
│   ├── Sidebar.js
│   ├── PrivateRoute.js
│   ├── Profile.js
│   ├── SignIn.js
│   ├── SignUp.js
│   ├── SuccessSignUp.js
│   ├── SearchReports.js
│   ├── PhotosPage.js
│   └── ProjectDocuments.js
└── ProgressChart/                 # Progress chart components
```

## Component Categories

### Discipline-Specific Components
Each discipline folder contains subfolders for different types of reports:

#### Environmental
- `punchlist/`: Components for punchlist reports
- `swppp/`: Components for SWPPP reports

#### Coating
- `daily/`: Components for daily coating reports
- `oversight/`: Components for oversight items

#### Welding
- `daily/`: Components for daily welding reports
- `photos/`: Components for welding photos

#### Utility
- `daily/`: Components for daily utility reports
- `photos/`: Components for utility photos

### Common Components
Shared components used across multiple disciplines:
- Navigation and layout components
- Authentication components
- Search and filtering components
- Photo management components
- Project document components

### Progress Chart Components
Components for displaying progress and statistics across all disciplines. 