/**
 * ClinicFinder - Find Nearest Healthcare Facilities
 * 
 * ELITE STANDARD: Government-grade healthcare facility locator
 * Offline-first design with cached facility data
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Hospital,
  Stethoscope,
  Search,
} from 'lucide-react';
import { MedicalButton, MedicalCard, colors } from '@/app/design-system';

interface ClinicFinderProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'health-center' | 'dispensary';
  distance: number; // km
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  services: string[];
}

export function ClinicFinder({ language, onBack }: ClinicFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const t = {
    sw: {
      title: 'Tafuta Kituo cha Afya',
      searchPlaceholder: 'Tafuta kituo...',
      nearYou: 'Karibu Nawe',
      getDirections: 'Pata Maelekezo',
      call: 'Piga Simu',
      distance: 'Umbali',
      openNow: 'Wazi Sasa',
      hospital: 'Hospitali',
      healthCenter: 'Kituo cha Afya',
      dispensary: 'Zahanati',
      services: 'Huduma',
      useMyLocation: 'Tumia Mahali Pangu',
      km: 'km',
    },
    en: {
      title: 'Find Healthcare Facility',
      searchPlaceholder: 'Search facility...',
      nearYou: 'Near You',
      getDirections: 'Get Directions',
      call: 'Call',
      distance: 'Distance',
      openNow: 'Open Now',
      hospital: 'Hospital',
      healthCenter: 'Health Center',
      dispensary: 'Dispensary',
      services: 'Services',
      useMyLocation: 'Use My Location',
      km: 'km',
    },
  }[language];

  // Mock facility data (would come from API in production)
  const facilities: Facility[] = [
    {
      id: '1',
      name: language === 'sw' ? 'Hospitali ya Mwananyamala' : 'Mwananyamala Hospital',
      type: 'hospital',
      distance: 2.3,
      address: 'Mwananyamala, Dar es Salaam',
      phone: '+255 22 270 0811',
      hours: '24/7',
      lat: -6.7624,
      lng: 39.2468,
      services: language === 'sw' 
        ? ['Dharura', 'Uzazi', 'Upasuaji', 'Lab']
        : ['Emergency', 'Maternity', 'Surgery', 'Lab'],
    },
    {
      id: '2',
      name: language === 'sw' ? 'Kituo cha Afya Kigogo' : 'Kigogo Health Center',
      type: 'health-center',
      distance: 1.5,
      address: 'Kigogo, Dar es Salaam',
      phone: '+255 22 270 1234',
      hours: '08:00 - 17:00',
      lat: -6.7924,
      lng: 39.2268,
      services: language === 'sw'
        ? ['Huduma ya Kwanza', 'Chanjo', 'Uzazi', 'HIV/AIDS']
        : ['Primary Care', 'Vaccinations', 'Maternity', 'HIV/AIDS'],
    },
    {
      id: '3',
      name: language === 'sw' ? 'Zahanati ya Tandale' : 'Tandale Dispensary',
      type: 'dispensary',
      distance: 0.8,
      address: 'Tandale, Dar es Salaam',
      phone: '+255 22 270 5678',
      hours: '08:00 - 16:00',
      lat: -6.7724,
      lng: 39.2368,
      services: language === 'sw'
        ? ['Huduma ya Kwanza', 'Dawa', 'Chanjo']
        : ['Primary Care', 'Pharmacy', 'Vaccinations'],
    },
  ];

  const filteredFacilities = facilities
    .filter(f =>
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.distance - b.distance);

  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const getFacilityIcon = (type: Facility['type']) => {
    return type === 'hospital' ? Hospital : type === 'health-center' ? Stethoscope : MapPin;
  };

  const getFacilityTypeLabel = (type: Facility['type']) => {
    return type === 'hospital' ? t.hospital : type === 'health-center' ? t.healthCenter : t.dispensary;
  };

  const openDirections = (facility: Facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: colors.neutral[700] }} />
            </button>
            <h1 className="text-lg font-semibold text-[#1A1D23]">{t.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E5E7EB] rounded-xl text-base focus:outline-none focus:border-[#0066CC]"
          />
        </div>

        {/* Use My Location Button */}
        {!userLocation && (
          <button
            onClick={requestLocation}
            disabled={loading}
            className="w-full group relative overflow-hidden"
          >
            {/* Animated Background Gradient */}
            <div 
              className="absolute inset-0 transition-all duration-300"
              style={{
                background: loading 
                  ? `linear-gradient(90deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 50%, ${colors.primary[100]} 100%)`
                  : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                backgroundSize: loading ? '200% 100%' : '100% 100%',
                animation: loading ? 'shimmer 1.5s infinite' : 'none'
              }}
            />
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl">
              {/* Icon Container with Pulse Animation */}
              <div 
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: loading ? 'none' : '0 0 0 0 rgba(255, 255, 255, 0.4)'
                }}
              >
                <Navigation 
                  className={`w-5 h-5 text-white transition-transform duration-300 ${
                    loading ? 'animate-spin' : 'group-hover:scale-110'
                  }`}
                />
                
                {/* Pulse Ring Effect */}
                {!loading && (
                  <span 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      animationDuration: '2s'
                    }}
                  />
                )}
              </div>
              
              {/* Text */}
              <span className="text-white font-semibold text-[15px]">
                {loading ? (language === 'sw' ? 'Inapata Mahali...' : 'Getting Location...') : t.useMyLocation}
              </span>
              
              {/* Chevron Indicator */}
              {!loading && (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <svg 
                    className="w-3 h-3 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              
              {/* Loading Dots */}
              {loading && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Shine Effect on Hover */}
            {!loading && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  animation: 'shine 2s infinite'
                }}
              />
            )}
            
            {/* CSS Animations */}
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              
              @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </button>
        )}

        {/* Facilities List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
            {t.nearYou}
          </h2>

          {filteredFacilities.map((facility) => {
            const FacilityIcon = getFacilityIcon(facility.type);
            return (
              <MedicalCard key={facility.id}>
                {/* Modern Card Layout with Visual Hierarchy */}
                <div className="relative overflow-hidden">
                  {/* Top Section: Header with Distance Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Left: Icon & Info */}
                    <div className="flex gap-3 flex-1 min-w-0">
                      {/* Gradient Icon Container */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                          boxShadow: `0 4px 12px ${colors.primary[500]}20`
                        }}
                      >
                        <FacilityIcon className="w-7 h-7 text-white" />
                        {/* 24/7 Badge Overlay */}
                        {facility.hours === '24/7' && (
                          <div 
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: colors.success[500] }}
                          >
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Facility Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[17px] text-[#1A1D23] mb-1 leading-tight">
                          {facility.name}
                        </h3>
                        <p 
                          className="text-[13px] font-medium mb-2"
                          style={{ color: colors.primary[600] }}
                        >
                          {getFacilityTypeLabel(facility.type)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Distance Badge */}
                    <div 
                      className="px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[60px]"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span 
                        className="text-[18px] font-bold leading-none"
                        style={{ color: colors.primary[600] }}
                      >
                        {facility.distance}
                      </span>
                      <span 
                        className="text-[11px] font-semibold mt-0.5"
                        style={{ color: colors.primary[500] }}
                      >
                        {t.km}
                      </span>
                    </div>
                  </div>

                  {/* Location & Hours Section */}
                  <div className="space-y-2 mb-4">
                    {/* Address with Icon */}
                    <div className="flex items-start gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: colors.neutral[100] }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: colors.neutral[600] }} />
                      </div>
                      <span className="text-[14px] text-[#4B5563] leading-relaxed">
                        {facility.address}
                      </span>
                    </div>

                    {/* Hours with Status */}
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.neutral[100] }}
                      >
                        <Clock className="w-4 h-4" style={{ color: colors.neutral[600] }} />
                      </div>
                      <span className="text-[14px] text-[#4B5563]">
                        {facility.hours}
                      </span>
                      {facility.hours === '24/7' && (
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: colors.success[500],
                            color: 'white',
                          }}
                        >
                          {t.openNow}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Services Pills - Modern Design */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {facility.services.slice(0, 4).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 text-[12px] font-semibold rounded-full"
                        style={{
                          backgroundColor: idx === 0 ? colors.primary[100] : colors.neutral[100],
                          color: idx === 0 ? colors.primary[700] : colors.neutral[700],
                        }}
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons - Enhanced Design */}
                  <div className="flex gap-3 pt-3 border-t" style={{ borderColor: colors.neutral[200] }}>
                    <MedicalButton
                      variant="primary"
                      size="sm"
                      onClick={() => openDirections(facility)}
                      className="flex-1"
                      style={{
                        boxShadow: `0 2px 8px ${colors.primary[500]}25`
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                      {t.getDirections}
                    </MedicalButton>
                    <MedicalButton
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = `tel:${facility.phone}`}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4" />
                      {t.call}
                    </MedicalButton>
                  </div>
                </div>
              </MedicalCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}