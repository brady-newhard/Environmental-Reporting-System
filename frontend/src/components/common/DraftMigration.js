import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, LinearProgress, Box } from '@mui/material';
import { migrateDrafts, hasDraftsToMigrate } from '../../utils/migrateDrafts';

const DraftMigration = () => {
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const checkForMigration = async () => {
      const needsMigration = await hasDraftsToMigrate();
      setOpen(needsMigration);
    };
    checkForMigration();
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const migrationResults = await migrateDrafts();
      setResults(migrationResults);
    } catch (error) {
      console.error('Migration failed:', error);
      setResults({
        success: false,
        migrated: 0,
        errors: 1
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (results?.success) {
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {results ? 'Migration Complete' : 'Draft Storage Migration'}
      </DialogTitle>
      <DialogContent>
        {!results ? (
          <>
            <Typography variant="body1" gutterBottom>
              We're upgrading the draft storage system to support larger files and better offline capabilities.
              This will migrate your existing drafts to the new storage system.
            </Typography>
            {migrating && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Migrating drafts...
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body1">
            {results.success ? (
              <>
                Successfully migrated {results.migrated} drafts to the new storage system.
                {results.errors > 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {results.errors} drafts could not be migrated.
                  </Typography>
                )}
              </>
            ) : (
              'An error occurred during migration. Please try again later.'
            )}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {!results && (
          <Button onClick={handleMigrate} disabled={migrating}>
            Start Migration
          </Button>
        )}
        <Button onClick={handleClose} color="primary">
          {results?.success ? 'Reload Page' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DraftMigration; 