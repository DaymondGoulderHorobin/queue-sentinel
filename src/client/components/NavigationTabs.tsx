import { APP_TABS } from '../../shared/constants';
import type { AppTabId } from '../../shared/types';

interface NavigationTabsProps {
  activeTab: AppTabId;
  onTabChange: (tabId: AppTabId) => void;
}

export const NavigationTabs = ({
  activeTab,
  onTabChange,
}: NavigationTabsProps) => {
  return (
    <nav className="navigation-tabs" aria-label="Queue Sentinel sections">
      {APP_TABS.map((tab) => (
        <button
          aria-current={activeTab === tab.id ? 'page' : undefined}
          className="navigation-tab"
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
