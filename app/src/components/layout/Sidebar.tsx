import React from 'react';
import type { PageData } from '@/types/assembly';

interface SidebarProps {
  pages: PageData[];
  currentPageId: string | null;
  onPageChange: (pageId: string) => void;
  activePage: PageData | null;
}

const Sidebar: React.FC<SidebarProps> = ({ pages, currentPageId, onPageChange }) => {
  return (
    <aside className="w-64 bg-background-panel border-r border-border flex flex-col shadow-lg z-10">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold font-heading tracking-widest text-foreground">PAGES</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {pages.length === 0 ? (
          <p className="text-xs text-foreground-muted italic p-4 text-center">
            No pages found.<br />Run Phase 1.5 first.
          </p>
        ) : (
          pages.map(page => {
            const isActive = page.id === currentPageId;
            return (
              <button
                key={page.id}
                id={`page-nav-${page.id}`}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-sm transition-colors border-l-2 ${
                  isActive 
                    ? 'bg-secondary text-border-blueprint border-border-blueprint' 
                    : 'text-foreground-muted hover:bg-secondary border-transparent'
                }`}
                onClick={() => onPageChange(page.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                {page.name}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

