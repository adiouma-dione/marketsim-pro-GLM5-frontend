// ============================================================
// MarketSim Pro - Decisions Tabs Component
// ------------------------------------------------------------

'use client';

import * as React from 'react';
import { Factory, DollarSign, Megaphone, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface DecisionsTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  disabled?: boolean;
}

// ------------------------------------------------------------
// Tab Configuration
// ------------------------------------------------------------

export const tabConfig = [
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    description: 'Volume, machines, maintenance',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    description: 'Emprunt, dette',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    description: 'Prix, budget pub',
  },
  {
    id: 'quality',
    label: 'Qualité & RH',
    icon: Heart,
    description: 'QHSE, R&D, salaires',
  },
] as const;

export type TabId = (typeof tabConfig)[number]['id'];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function DecisionsTabs({
  children,
  defaultTab = 'production',
  onTabChange,
  disabled = false,
}: DecisionsTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2 px-3 py-2',
                activeTab === tab.id && 'bg-white shadow-sm'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab Contents */}
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const tabId = tabConfig[index]?.id;
          return (
            <TabsContent value={tabId || ''} className="mt-0">
              {child}
            </TabsContent>
          );
        }
        return null;
      })}
    </Tabs>
  );
}

// ------------------------------------------------------------
// Tab Content Wrapper
// ------------------------------------------------------------

interface DecisionTabContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DecisionTabContent({
  children,
  className,
}: DecisionTabContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// Tab Header
// ------------------------------------------------------------

interface TabHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function TabHeader({ title, description, icon: Icon }: TabHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
