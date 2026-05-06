/**
 * EliteHome — Premium Home Screen 2026 Redesign
 * Dark header gradient, animated emergency strip, glassmorphism cards,
 * real greeting, rich quick-access grid.
 */

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Stethoscope,
  Calendar,
  FileText,
  MapPin,
  ChevronRight,
  Bell,
  Pill,
  Activity,
  Heart,
} from 'lucide-react';

interface EliteHomeProps {
  userName?: string;
  language: 'sw' | 'en';
  onNavigate: (route: string) => void;
}

function useGreeting(language: 'sw' | 'en') {
  const hour = new Date().getHours();
  const en = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const sw = hour < 12 ? 'Habari za asubuhi' : hour < 17 ? 'Habari za mchana' : 'Habari za jioni';
  return language === 'sw' ? sw : en;
}

export function EliteHome({ userName = 'User', language, onNavigate }: EliteHomeProps) {
  const greeting = useGreeting(language);
  const [emergencyPulse, setEmergencyPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setEmergencyPulse((p) => !p), 1800);
    return () => clearInterval(id);
  }, []);

  const t = {
    sw: {
      greeting,
      subGreeting: 'Afya yako ni kipaumbele chetu',
      emergencyLabel: 'Dharura ya Haraka',
      emergencyBtn: 'Piga 114',
      getCare: 'Pata Huduma',
      getCareDesc: 'Angalia dalili · Pata ushauri',
      sectionQuick: 'Huduma',
      sectionUpcoming: 'Inakuja',
      nav: {
        appointments: 'Miadi',
        records: 'Rekodi',
        findClinic: 'Kliniki',
        medications: 'Dawa',
        vitals: 'Dalili',
      },
      upcomingAppt: 'Miadi ya Kliniki',
      upcomingFacility: 'Hospitali ya Mwananyamala',
      upcomingTime: 'Jumatatu, 10:00',
      upcomingBadge: 'Kesho',
      viewAll: 'Angalia Zote',
      healthTip: 'Kumbukumbu',
      healthTipText: 'Kunywa maji ya kutosha leo — lita 2 kwa mtu mzima.',
    },
    en: {
      greeting,
      subGreeting: 'Your health is our priority',
      emergencyLabel: 'Medical Emergency',
      emergencyBtn: 'Call 114',
      getCare: 'Get Care',
      getCareDesc: 'Check symptoms · Get guidance',
      sectionQuick: 'Services',
      sectionUpcoming: 'Upcoming',
      nav: {
        appointments: 'Appointments',
        records: 'Records',
        findClinic: 'Find Clinic',
        medications: 'Medications',
        vitals: 'Check Vitals',
      },
      upcomingAppt: 'Clinic Appointment',
      upcomingFacility: 'Mwananyamala Hospital',
      upcomingTime: 'Monday, 10:00',
      upcomingBadge: 'Tomorrow',
      viewAll: 'View All',
      healthTip: 'Daily Reminder',
      healthTipText: 'Stay hydrated today — aim for 2 litres of water.',
    },
  }[language];

  const quickLinks = [
    { id: 'appointments', icon: Calendar, label: t.nav.appointments, color: '#1B998B', bg: '#E8F5E9', route: 'appointments' },
    { id: 'records', icon: FileText, label: t.nav.records, color: '#0F3D56', bg: '#E3F2FD', route: 'records' },
    { id: 'find-clinic', icon: MapPin, label: t.nav.findClinic, color: '#5C35A3', bg: '#EDE7F6', route: 'find-clinic' },
    { id: 'medications', icon: Pill, label: t.nav.medications, color: '#C84B31', bg: '#FBE9E7', route: 'medications' },
  ];

  return (
    <div className="afya-home">
      {/* ── Header ────────────────────────────────────── */}
      <header className="afya-home__header">
        <div className="afya-home__header-bg" />
        <div className="afya-home__header-content">
          <div className="afya-home__greeting">
            <p className="afya-home__greeting-label">{t.greeting},</p>
            <h1 className="afya-home__greeting-name">{userName}</h1>
            <p className="afya-home__greeting-sub">{t.subGreeting}</p>
          </div>
          <button
            id="notifications-btn"
            className="afya-home__notif-btn"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="afya-home__notif-dot" />
          </button>
        </div>
      </header>

      <div className="afya-home__body">
        {/* ── Emergency Strip ───────────────────────────── */}
        <div className="afya-emergency">
          <div className="afya-emergency__left">
            <span className={`afya-emergency__pulse${emergencyPulse ? ' afya-emergency__pulse--on' : ''}`} />
            <span className="afya-emergency__label">{t.emergencyLabel}</span>
          </div>
          <a
            href="tel:114"
            className="afya-emergency__btn"
            id="emergency-call-btn"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.emergencyBtn}</span>
          </a>
        </div>

        {/* ── Get Care ─────────────────────────────────── */}
        <button
          id="get-care-btn"
          className="afya-get-care"
          onClick={() => onNavigate('assistant')}
        >
          <div className="afya-get-care__icon">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="afya-get-care__text">
            <span className="afya-get-care__title">{t.getCare}</span>
            <span className="afya-get-care__desc">{t.getCareDesc}</span>
          </div>
          <ChevronRight className="afya-get-care__arrow w-5 h-5" />
        </button>

        {/* ── Quick Services ───────────────────────────── */}
        <section className="afya-home__section">
          <h2 className="afya-home__section-title">{t.sectionQuick}</h2>
          <div className="afya-grid">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  id={`quick-${link.id}-btn`}
                  className="afya-grid__card"
                  onClick={() => onNavigate(link.route)}
                >
                  <div className="afya-grid__icon" style={{ background: link.bg }}>
                    <Icon className="w-6 h-6" style={{ color: link.color }} strokeWidth={1.8} />
                  </div>
                  <span className="afya-grid__label">{link.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Upcoming ─────────────────────────────────── */}
        <section className="afya-home__section">
          <div className="afya-home__section-header">
            <h2 className="afya-home__section-title">{t.sectionUpcoming}</h2>
            <button
              className="afya-home__view-all"
              onClick={() => onNavigate('appointments')}
            >
              {t.viewAll}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="afya-appt-card" onClick={() => onNavigate('appointments')}>
            <div className="afya-appt-card__icon">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="afya-appt-card__body">
              <p className="afya-appt-card__title">{t.upcomingAppt}</p>
              <div className="afya-appt-card__meta">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.upcomingFacility}</span>
              </div>
              <p className="afya-appt-card__time">{t.upcomingTime}</p>
            </div>
            <span className="afya-appt-card__badge">{t.upcomingBadge}</span>
          </div>
        </section>

        {/* ── Health Tip ───────────────────────────────── */}
        <div className="afya-tip">
          <div className="afya-tip__icon">
            <Heart className="w-4 h-4" />
          </div>
          <div className="afya-tip__body">
            <p className="afya-tip__label">{t.healthTip}</p>
            <p className="afya-tip__text">{t.healthTipText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}