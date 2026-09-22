import { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TrustItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export * from './document';
export * from './analysis';
export * from './chat';
export * from './comparison';
