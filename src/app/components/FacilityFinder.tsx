/**
 * FacilityFinder - Find nearby health facilities with maps
 * Shows facilities, distances, services, and current load
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  MapPin,
  Phone,
  Clock,
  ChevronLeft,
  Navigation,
  Search,
  Filter,
  Star,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { api } from '@/app/services/api';
import type { Facility as ApiFacility } from '@/app/services/supabase';
import { toast } from 'sonner';

const translations = {
  sw: {
    title: 'Tafuta Kituo cha Afya',
    subtitle: 'Pata kituo cha karibu nawe',
    search: 'Tafuta kituo...',
    nearestFacilities: 'Vituo vya Karibu',
    distance: 'Umbali',
    away: 'mbali',
    call: 'Piga Simu',
    getDirections: 'Pata Maelekezo',
    openNow: 'Wazi Sasa',
    closed: 'Imefungwa',
    facilityLoad: 'Msongamano',
    waitTime: 'Muda wa Kusubiri',
    services: 'Huduma',
    minutes: 'dakika',
    filterByService: 'Chuja kwa Huduma',
    all: 'Zote',
    emergency: 'Dharura',
    maternal: 'Mama na Mtoto',
    ncd: 'Magonjwa Sugu',
    pharmacy: 'Duka la Dawa',
    lab: 'Maabara',
    currentLocation: 'Eneo Langu',
    noFacilities: 'Hakuna Vituo Vilivyopatikana',
    rating: 'Ukadiriaji',
  },
  en: {
    title: 'Find Health Facility',
    subtitle: 'Locate facilities near you',
    search: 'Search for facility...',
    nearestFacilities: 'Nearest Facilities',
    distance: 'Distance',
    away: 'away',
    call: 'Call',
    getDirections: 'Get Directions',
    openNow: 'Open Now',
    closed: 'Closed',
    facilityLoad: 'Facility Load',
    waitTime: 'Wait Time',
    services: 'Services',
    minutes: 'minutes',
    filterByService: 'Filter by Service',
    all: 'All',
    emergency: 'Emergency',
    maternal: 'Maternal Care',
    ncd: 'Chronic Diseases',
    pharmacy: 'Pharmacy',
    lab: 'Laboratory',
    currentLocation: 'My Location',
    noFacilities: 'No Facilities Found',
    rating: 'Rating',
  },
};

interface Facility {
  id: string;
  name: Record<'sw' | 'en', string>;
  address: Record<'sw' | 'en', string>;
  distance: string;
  phone: string;
  isOpen: boolean;
  openHours: string;
  waitTime: number;
  currentLoad: 'low' | 'medium' | 'high';
  services: string[];
  rating: number;
  latitude: number;
  longitude: number;
}

export function FacilityFinder({ onBack }: { onBack: () => void }) {
  const { language } = useAppStore();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [facilities, setFacilities] = useState<ApiFacility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load facilities on mount
  useEffect(() => {
    loadFacilities();
    getUserLocation();
  }, []);

  const loadFacilities = async () => {
    setIsLoading(true);
    const response = await api.facilities.list();
    if (response.success && response.data) {
      setFacilities(response.data);
    } else {
      toast.error(language === 'sw' ? 'Imeshindwa kupakia vituo' : 'Failed to load facilities');
    }
    setIsLoading(false);
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Load nearby facilities
          loadNearbyFacilities(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Fallback to Dar es Salaam center
          setUserLocation({ lat: -6.7924, lng: 39.2083 });
        }
      );
    }
  };

  const loadNearbyFacilities = async (lat: number, lng: number) => {
    const response = await api.facilities.searchNearby(lat, lng, 50); // 50km radius
    if (response.success && response.data) {
      setFacilities(response.data as any);
    }
  };

  // Convert API facilities to UI format
  const convertToUIFormat = (apiFacility: ApiFacility): Facility => {
    // Calculate distance if user location available
    let distance = '—';
    if (userLocation && apiFacility.latitude && apiFacility.longitude) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        apiFacility.latitude,
        apiFacility.longitude
      );
      distance = `${dist.toFixed(1)} km`;
    }

    return {
      id: apiFacility.id,
      name: { sw: apiFacility.name_sw, en: apiFacility.name },
      address: { sw: apiFacility.address_sw, en: apiFacility.address },
      distance,
      phone: apiFacility.phone || '',
      isOpen: true, // TODO: Calculate from operating_hours
      openHours: '08:00 - 16:00', // TODO: Parse from operating_hours JSON
      waitTime: apiFacility.wait_time_minutes || 30,
      currentLoad: apiFacility.current_load || 'medium',
      services: apiFacility.services || [],
      rating: 4.2, // TODO: Add ratings table
      latitude: apiFacility.latitude || 0,
      longitude: apiFacility.longitude || 0,
    };
  };

  const facilitiesUI = facilities.map(convertToUIFormat);

  // Calculate distance (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'low':
        return { bg: '#ECFDF5', text: '#10B981', border: '#86EFAC' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D' };
      case 'high':
        return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  // Filter facilities
  const filteredFacilities = facilitiesUI.filter((facility) => {
    const matchesSearch =
      searchQuery === '' ||
      facility.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address[language].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      selectedService === 'all' || facility.services.includes(selectedService);

    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{language === 'sw' ? 'Rudi' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Service Filter */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  selectedService === service.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl h-48 flex items-center justify-center border-2 border-blue-200 mb-6">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-900">
              {language === 'sw' ? 'Ramani Itaonekana Hapa' : 'Map will appear here'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {t.currentLocation}: {language === 'sw' ? 'Tandale, Dar es Salaam' : 'Tandale, Dar es Salaam'}
            </p>
          </div>
        </div>
      </div>

      {/* Facilities List */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.nearestFacilities}</h2>

        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{t.noFacilities}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFacilities.map((facility, idx) => {
              const loadColors = getLoadColor(facility.currentLoad);

              return (
                <motion.div
                  key={facility.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {facility.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{facility.address[language]}</p>

                      {/* Distance & Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-blue-600">
                          <Navigation className="w-4 h-4" />
                          <span className="font-semibold">{facility.distance}</span>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            facility.isOpen
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {facility.isOpen ? t.openNow : t.closed}
                        </span>

                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {facility.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{facility.waitTime}</p>
                      <p className="text-xs text-gray-600">{t.minutes}</p>
                    </div>

                    <div
                      className="rounded-lg p-3 text-center border"
                      style={{
                        backgroundColor: loadColors.bg,
                        borderColor: loadColors.border,
                      }}
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: loadColors.text }}>
                        {t.facilityLoad}
                      </p>
                      <p className="text-sm font-bold" style={{ color: loadColors.text }}>
                        {facility.currentLoad.toUpperCase()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{facility.openHours}</p>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">{t.services}:</p>
                    <div className="flex flex-wrap gap-2">
                      {facility.services.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                          {services.find((s) => s.id === service)?.label || service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`, '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      {t.getDirections}
                    </button>

                    <button
                      onClick={() => (window.location.href = `tel:${facility.phone}`)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {t.call}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}