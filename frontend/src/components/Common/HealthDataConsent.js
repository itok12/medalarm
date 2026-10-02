import React from 'react';
import { Link, Typography } from '@mui/material';

// Must match HealthDataConsent.CURRENT_VERSION on the server. Bump both when
// this wording changes, so existing users are asked again.
export const HEALTH_DATA_CONSENT_VERSION = '2026-10';

export function HealthDataConsentText({ variant = 'body2' }) {
  return (
    <Typography variant={variant} component="span">
      I agree that MedAlarm stores my medicines, reminder times and dose history on its servers so it can
      sync them and send reminders. This is health information. I can export it or delete my account and
      all of it at any time. See the{' '}
      <Link href="/privacy-policy.html" target="_blank" rel="noopener">privacy policy</Link>.
    </Typography>
  );
}

export function MedicalDisclaimer({ sx }) {
  return (
    <Typography variant="caption" color="text.secondary" component="p" sx={sx}>
      MedAlarm is a reminder tool, not medical advice. Follow your doctor or pharmacist&apos;s instructions,
      and don&apos;t change or stop a medicine because of anything in this app. Reminders depend on your
      phone&apos;s settings and can be delayed, so don&apos;t rely on MedAlarm alone for medicines where a missed
      or late dose is dangerous.
    </Typography>
  );
}
