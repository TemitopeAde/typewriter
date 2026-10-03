import React, { type FC } from 'react';
import { Box, Button, Text, TextButton } from '@wix/design-system';
import { useAppAccess } from './use-app-access';

const APP_ID = '51843ef5-c35a-443a-aa77-26b013a260b6';

export const PanelAccessNotice: FC = () => {
  const access = useAppAccess();
  if (access.status === 'pro') return null;

  return (
    <Box direction="vertical" gap="SP2" padding="SP3" role="status">
      {access.status === 'loading' ? (
        <Text size="small">Checking your plan…</Text>
      ) : access.status === 'error' ? (
        <>
          <Text size="small">Unable to check your plan. Try again to see your trial options.</Text>
          <TextButton size="small" onClick={() => { void access.refresh(); }}>Retry</TextButton>
        </>
      ) : access.status === 'trial' ? (
        <>
          <Text size="small" weight="bold">Your free trial is active</Text>
          <Text size="small">Your animation can appear on your published site during your trial. Keep Pro to continue after the trial ends.</Text>
        </>
      ) : (
        <>
          <Text size="small" weight="bold">Bring your animation to your published site</Text>
          <Text size="small">You can try the animation in the editor and preview. Start your free trial to show it on your published site. Pro is required after the trial ends.</Text>
          <Button
            size="small"
            fullWidth
            disabled={!access.instanceId}
            onClick={() => {
              if (access.instanceId) {
                window.open(
                  `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${encodeURIComponent(access.instanceId)}`,
                  '_blank',
                  'noopener,noreferrer'
                );
              }
            }}
          >
            Start free trial
          </Button>
          <TextButton size="small" onClick={() => { void access.refresh(); }}>Check access again</TextButton>
        </>
      )}
    </Box>
  );
};
