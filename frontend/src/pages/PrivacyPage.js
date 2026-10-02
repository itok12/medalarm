import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import AppScreen from '../components/Layout/AppScreen';
import { MedicalDisclaimer } from '../components/Common/HealthDataConsent';

// Plain-language summary of docs/PRIVACY_POLICY.md; the full policy is bundled
// with the app at /privacy-policy.html, so it also opens offline.
function Section({ icon, title, children }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ color: 'text.secondary', lineHeight: 1.8, '& p': { m: 0, mb: 1.5 } }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function PrivacyPage() {
  return (
    <AppScreen
      title="Privacy"
      subtitle="What MedAlarm keeps, where it goes, and how you stay in control."
      maxWidth={860}
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Section icon={<SecurityOutlinedIcon color="primary" />} title="Without an account, nothing leaves your phone">
          <p>
            In guest mode your medicines, reminders and dose history are stored only on this device. MedAlarm&apos;s
            servers never receive them.
          </p>
        </Section>

        <Section icon={<LockOutlinedIcon color="secondary" />} title="With an account">
          <p>
            We store your username, email, a hash of your password, your reminder settings, and your medicines and
            dose history, so they sync and can be shared with a caregiver you approve. Medicine information is
            health data, so we only store it with your explicit consent, which you give when you sign up.
          </p>
          <p>
            Our servers are run by Render (United States). If you use &quot;Scan label&quot;, the photo is sent to
            Anthropic (United States) to read the label and is not kept by MedAlarm.
          </p>
        </Section>

        <Section icon={<VerifiedUserOutlinedIcon color="success" />} title="What we don't do">
          <p>
            We don&apos;t sell data, show ads, or use analytics trackers. A caregiver sees your history only after
            you approve their request, and can never change your medicines or reminders.
          </p>
        </Section>

        <Section icon={<TuneOutlinedIcon color="primary" />} title="Your controls">
          <p>Export your dose history as a CSV file from the History screen.</p>
          <p>Stop sharing with a caregiver at any time from the Care tab.</p>
          <p>Delete your account and all of its data from Profile, or at medalarmapp.com/delete-account.html.</p>
          <p>
            Ask for a copy of your data or anything else at{' '}
            <Link href="mailto:support@medalarmapp.com">support@medalarmapp.com</Link>. You can also complain to the
            Information Commissioner&apos;s Office (ico.org.uk).
          </p>
        </Section>

        <MedicalDisclaimer />

        <Button
          variant="outlined"
          href="/privacy-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ justifySelf: 'start' }}
        >
          Read the full privacy policy
        </Button>
      </Box>
    </AppScreen>
  );
}

export default PrivacyPage;
