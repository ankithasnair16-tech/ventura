import React from 'react';
import { Home, ListChecks, Compass, MessageCircleHeart } from 'lucide-react';
import { TabId } from '../types/ventura';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  planCount?: number;
}

const NAV_ITEMS: Array<{
  id: TabId;
  label: string;
  Icon: React.FC<{ className?: string; strokeWidth?: number }>;
}> = [
  { id: 'home', label: 'HOME', Icon: Home },
  { id: 'plan', label: 'MY PLAN', Icon: ListChecks },
  { id: 'explore', label: 'EXPLORE', Icon: Compass },
  { id: 'ask', label: 'ASK VENTURA', Icon: MessageCircleHeart },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  planCount,
}) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF8F1]/95 backdrop-blur-md border-t border-[#343A32]/10 pb-safe"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4 items-center h-16 px-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[48px] flex flex-col items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#3D6048] ${
                isActive
                  ? 'text-[#3D6048]'
                  : 'text-[#343A32]/60 hover:text-[#343A32]'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-colors duration-150 ${
                  isActive ? 'bg-[#3D6048]/12' : 'bg-transparent'
                }`}
              >
                <Icon
                  className="w-[21px] h-[21px]"
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                {id === 'plan' && typeof planCount === 'number' && planCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#D98C68] text-[#FBF8F1] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {planCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#3D6048]' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
