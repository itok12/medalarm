import React from 'react';
import { Box, Typography } from '@mui/material';

function AppScreen({
  title,
  subtitle,
  actions = null,
  maxWidth = 1100,
  children,
}) {
  return (
    <Box
      sx={{
        maxWidth,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        pt: { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 5 },
      }}
    >
      {(title || subtitle || actions) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>
      )}

      {children}
    </Box>
  );
}

export default AppScreen;
