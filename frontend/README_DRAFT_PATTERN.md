# Robust Offline/Online Draft Pattern for React Reports

**NOTE:** This README is a living document. As you debug, improve, or change the pattern, update this file so it always reflects the latest best practices and your preferred styles. Use it as the reference for all new report types.

This pattern enables seamless offline and online draft management for field reporting apps. It supports:
- Saving drafts to localStorage when offline
- Syncing drafts to the backend when online
- Fetching and displaying drafts from both sources
- Consistent MUI-based formatting

## 1. Utility: `draftStorage.js`
- Located in `src/utils/draftStorage.js`
- Exposes:
  - `saveDraft(reportType, draft)`
  - `getAllDrafts(reportType)`
  - `deleteDraft(reportType, id, isLocal)`
  - `syncDrafts(reportType)`

## 2. Drafts List Page Template
- Use `getAllDrafts` to fetch all drafts (local and backend)
- Use `syncDrafts` to sync local drafts when online
- Show an indicator for local drafts (e.g., a Chip or badge)
- Example: See `EnvironmentalDailyReportDrafts.js`

## 3. Form Page Template
- Use `saveDraft` to save (works offline/online)
- After saving, set the draft ID in state to show the Review button
- Use MUI components for all fields
- Example: See `EnvironmentalDailyReportForm.js`

## 4. Review Page Template
- Always load the draft by ID using `getAllDrafts`
- Display all fields, using MUI for layout
- Example: See `EnvironmentalDailyReportReview.js`

## 5. How to Extend for New Reports
1. Copy the three component files (list, form, review) and rename for your new report type
2. Change `reportType` to match your new report (e.g., 'welding', 'coating', etc.)
3. Update the field list and layout as needed
4. Use the same utility for all report types
5. **Check and update routes:** Ensure that the edit button on the drafts page navigates to the original form route (e.g., `/environmental/reports/daily/edit/:id`) if it exists, or use the generic route otherwise. Always verify that the routes in your router (e.g., in `App.js`) are correctly set up for your new report type.

## 6. Syncing
- Local drafts are automatically synced to the backend when the app comes online
- The UI always shows both local and backend drafts

## 7. Example File Structure
```
frontend/src/utils/draftStorage.js
frontend/src/components/disciplines/environmental/daily/EnvironmentalDailyReportDrafts.js
frontend/src/components/disciplines/environmental/daily/EnvironmentalDailyReportForm.js
frontend/src/components/disciplines/environmental/daily/EnvironmentalDailyReportReview.js
```

## 8. Notes
- Always use MUI for consistent formatting
- Add or adjust fields as needed for your report type
- Use the `isLocal` property to show which drafts are unsynced
- As you debug and improve, update this README and the boilerplate template so all future reports benefit from your latest best practices.

---

**This pattern is robust, future-proof, and easy to extend for all your reporting needs!** 