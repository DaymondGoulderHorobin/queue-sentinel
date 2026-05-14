import type { PropsWithChildren } from 'react';

import { NavigationTabs } from './NavigationTabs';
import { StatusBadge } from './StatusBadge';
import { APP_NAME, APP_TAGLINE, SPRINT_LABEL } from '../../shared/constants';
import type { AppTabId } from '../../shared/types';

interface AppShellProps extends PropsWithChildren {
  activeTab: AppTabId;
  onTabChange: (tabId: AppTabId) => void;
}

export const AppShell = ({
  activeTab,
  children,
  onTabChange,
}: AppShellProps) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup" aria-label={APP_NAME}>
          <div className="brand-mark">QS</div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>{APP_TAGLINE}</p>
          </div>
        </div>
        <StatusBadge tone="build">{SPRINT_LABEL}</StatusBadge>
      </header>

      <NavigationTabs activeTab={activeTab} onTabChange={onTabChange} />

      <main className="app-main">{children}</main>
    </div>
  );
};
