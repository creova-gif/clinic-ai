/**
 * NationalBottomNav — Premium Redesign 2026
 * Pill-style floating tab bar with smooth active indicator,
 * icon + label, 44px touch targets.
 */

import React from 'react';
import { Home, MessageSquare, Calendar, User, Stethoscope } from 'lucide-react';

interface NationalBottomNavProps {
  currentRoute: string;
  language: 'sw' | 'en';
  onNavigate: (route: string) => void;
}

const tabs = [
  { id: 'home', en: 'Home', sw: 'Nyumbani', icon: Home },
  { id: 'assistant', en: 'Care', sw: 'Huduma', icon: Stethoscope },
  { id: 'appointments', en: 'Bookings', sw: 'Miadi', icon: Calendar },
  { id: 'messages', en: 'Messages', sw: 'Ujumbe', icon: MessageSquare },
  { id: 'profile', en: 'Profile', sw: 'Wasifu', icon: User },
];

export function NationalBottomNav({ currentRoute, language, onNavigate }: NationalBottomNavProps) {
  return (
    <nav className="afya-nav" role="navigation" aria-label="Main navigation">
      <div className="afya-nav__inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id || (tab.id === 'home' && currentRoute === '');
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              className={`afya-nav__tab${isActive ? ' afya-nav__tab--active' : ''}`}
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={language === 'sw' ? tab.sw : tab.en}
            >
              <div className={`afya-nav__icon-wrap${isActive ? ' afya-nav__icon-wrap--active' : ''}`}>
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
              </div>
              <span className="afya-nav__label">
                {language === 'sw' ? tab.sw : tab.en}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}