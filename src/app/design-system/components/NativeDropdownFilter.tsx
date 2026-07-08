/**
 * NativeDropdownFilter - Accessible Filter Component
 * 
 * USAGE:
 * Standard dropdown for filtering lists.
 * Uses native <select> for maximum compatibility.
 * 
 * DESIGN:
 * - Native select (works everywhere, no polyfills)
 * - Label + dropdown layout (clear context)
 * - Border styling matches design system
 * - Focus states for keyboard navigation
 * 
 * ACCESSIBILITY:
 * - Native control (screen reader friendly)
 * - Keyboard navigable
 * - Clear label association
 * - Works on all devices (no custom JS)
 * 
 * WHY NATIVE?
 * - No horizontal scroll issues on mobile
 * - No JavaScript dependencies
 * - Familiar UI pattern (reduces cognitive load)
 * - Better performance on low-end devices
 * 
 * EXAMPLES:
 * - Message grouping (Clinical/Appointments/Notifications)
 * - Health records filter (All/Visits/Tests/Medications)
 * - Date range selection
 */

import React from 'react';
import { colors, borderRadius, spacing, accessibility } from '../tokens';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface NativeDropdownFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function NativeDropdownFilter({
  label,
  value,
  onChange,
  options,
  className = '',
}: NativeDropdownFilterProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {/* Label */}
      <label
        htmlFor="filter-select"
        className="text-sm font-medium flex-shrink-0"
        style={{ color: colors.neutral[600] }}
      >
        {label}
      </label>

      {/* Native Select Dropdown */}
      <select
        id="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-10 px-4 border-2 rounded-lg text-sm font-medium bg-white transition-colors focus:outline-none"
        style={{
          borderColor: colors.neutral[300],
          color: colors.neutral[900],
          borderRadius: borderRadius.lg,
          minHeight: accessibility.minTouchTarget,
        }}
        onFocus={(e) => {
          (e.target as HTMLElement).style.borderColor = colors.primary[500];
        }}
        onBlur={(e) => {
          (e.target as HTMLElement).style.borderColor = colors.neutral[300];
        }}
        onMouseEnter={(e) => {
          if (document.activeElement !== e.target) {
            (e.target as HTMLElement).style.borderColor = colors.neutral[400];
          }
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.target) {
            (e.target as HTMLElement).style.borderColor = colors.neutral[300];
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * // Message grouping filter
 * const [selectedGroup, setSelectedGroup] = useState('all');
 * 
 * <NativeDropdownFilter
 *   label="Show:"
 *   value={selectedGroup}
 *   onChange={setSelectedGroup}
 *   options={[
 *     { value: 'all', label: 'All' },
 *     { value: 'clinical', label: 'Clinical', count: 5 },
 *     { value: 'appointments', label: 'Appointments', count: 2 },
 *     { value: 'notifications', label: 'Notifications', count: 8 },
 *   ]}
 * />
 * 
 * // Health records filter
 * const [recordType, setRecordType] = useState('all');
 * 
 * <NativeDropdownFilter
 *   label="Filter:"
 *   value={recordType}
 *   onChange={setRecordType}
 *   options={[
 *     { value: 'all', label: 'All Records' },
 *     { value: 'visit', label: 'Visits' },
 *     { value: 'test', label: 'Tests' },
 *     { value: 'medication', label: 'Medications' },
 *     { value: 'procedure', label: 'Procedures' },
 *   ]}
 * />
 * 
 * // Bilingual support
 * <NativeDropdownFilter
 *   label={language === 'sw' ? 'Chuja:' : 'Filter:'}
 *   value={filter}
 *   onChange={setFilter}
 *   options={[
 *     { value: 'all', label: language === 'sw' ? 'Zote' : 'All' },
 *     { value: 'urgent', label: language === 'sw' ? 'Muhimu' : 'Urgent' },
 *   ]}
 * />
 */