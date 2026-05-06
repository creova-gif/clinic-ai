import React from 'react';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'normal';

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  icon?: string;
  className?: string;
}

const config: Record<StatusVariant, { bg: string; color: string; icon: string }> = {
  success: { bg: '#d1fae5', color: '#065f46', icon: '✓' },
  warning: { bg: '#fef3c7', color: '#92400e', icon: '⚠' },
  danger:  { bg: '#fee2e2', color: '#991b1b', icon: '!' },
  info:    { bg: '#e0e7ff', color: '#3730a3', icon: 'ℹ' },
  pending: { bg: '#fef9c3', color: '#713f12', icon: '◷' },
  normal:  { bg: '#f0fdf4', color: '#166534', icon: '●' },
};

export function StatusBadge({ variant, label, icon, className = '' }: StatusBadgeProps) {
  const { bg, color, icon: defaultIcon } = config[variant];
  const displayIcon = icon ?? defaultIcon;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{ background: bg, color }}
    >
      <span aria-hidden="true">{displayIcon}</span>
      {label}
    </span>
  );
}
