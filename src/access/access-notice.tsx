import React, { type FC } from 'react';
import type { AccessState } from './access-store';
import styles from './access-notice.module.css';

const APP_ID = '51843ef5-c35a-443a-aa77-26b013a260b6';

export const AccessNotice: FC<{ access: AccessState; onRetry: () => void }> = ({ access, onRetry }) => (
  <div className={styles.notice}>
    {access.status === 'loading' ? (
      <p role="status"></p>
    ) : access.status === 'error' ? (
      <>
        <p role="status">Unable to verify app access. Please try again.</p>
        <button type="button" onClick={onRetry}>Retry</button>
      </>
    ) : (
      <>
        <h3>Pro required</h3>
        <p>{access.freeTrialAvailable
          ? 'Try all typewriter features free for 3 days, or unlock them with Pro.'
          : 'Unlock all typewriter features with Pro.'}</p>
        {access.instanceId && access.freeTrialAvailable && (
          <a
            className={styles.primaryAction}
            href={`https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${encodeURIComponent(access.instanceId)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Start free trial
          </a>
        )}
        {access.instanceId && (
          <a
            href={`https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${encodeURIComponent(access.instanceId)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Pro plans
          </a>
        )}
        <button type="button" onClick={onRetry}>Check access again</button>
      </>
    )}
  </div>
);
