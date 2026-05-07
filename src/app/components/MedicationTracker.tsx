/**
 * MedicationTracker - True Fusion redesign
 * Preserves all data-fetching logic; replaces UI layer only.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Pill, Clock, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '@/app/services/api';
import type { Medication as ApiMedication } from '@/app/services/supabase';
import { getAuthUserId } from '@/app/utils/auth';
import { toast } from 'sonner';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { StreakGrid } from '@/app/components/ui/StreakGrid';
import { ConfettiCelebration } from '@/app/components/ui/ConfettiCelebration';

const MOCK_USER_ID = 'mock_user_001';

interface MedicationUI {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  refillDays: number;
  dosesLeft: number;
  totalDoses: number;
  condition: string;
  missedDoses: number;
}

type CardStatus = 'pending' | 'taken' | 'missed';

interface ScheduleItem extends MedicationUI {
  scheduledTime: string;
  status: CardStatus;
}

function getCardStatus(taken: boolean, scheduledTime: string): CardStatus {
  if (taken) return 'taken';
  // Determine if the scheduled time has passed today
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  if (now > scheduled) return 'missed';
  return 'pending';
}

export function MedicationTracker({ onBack }: { onBack: () => void }) {
  const { language } = useApp();

  // ── Data-fetching (preserved exactly) ──────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<ApiMedication[]>([]);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    const userId = await getAuthUserId() ?? MOCK_USER_ID;
    const response = await api.medications.list(userId);
    if (response.success && response.data) {
      setMedications(response.data);
    } else {
      toast.error(language === 'sw' ? 'Imeshindwa kupakia dawa' : 'Failed to load medications');
    }
    setIsLoading(false);
  };

  const medicationsUI: MedicationUI[] = medications.map((med) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    times: med.reminder_times,
    refillDays: 7,
    dosesLeft: 15,
    totalDoses: 30,
    condition: '',
    missedDoses: 0,
  }));

  // ── UI state ────────────────────────────────────────────────────────────────
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [confettiKey, setConfettiKey] = useState<string | null>(null);
  const [streakConfetti, setStreakConfetti] = useState(false);

  const todaySchedule: ScheduleItem[] = medicationsUI.flatMap((med) =>
    med.times.map((time) => {
      const key = `${med.id}-${time}`;
      const taken = takenIds.has(key);
      return { ...med, scheduledTime: time, status: getCardStatus(taken, time) };
    })
  );

  const takenToday = todaySchedule.filter((item) => item.status === 'taken').length;
  const totalScheduledToday = todaySchedule.length;

  const handleTake = (item: ScheduleItem) => {
    const key = `${item.id}-${item.scheduledTime}`;
    setTakenIds((prev) => new Set(prev).add(key));
    setConfettiKey(key);

    // 7-day streak celebration
    const newTaken = takenToday + 1;
    if (newTaken === 7 || (totalScheduledToday === 7 && newTaken === 7)) {
      setStreakConfetti(true);
      toast.success('Hongera! Siku 7 mfululizo 🎉');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main role="main" className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Confetti fires on card-level take action */}
      <ConfettiCelebration
        trigger={confettiKey !== null}
        onDone={() => setConfettiKey(null)}
      />
      {/* 7-day streak confetti */}
      <ConfettiCelebration
        trigger={streakConfetti}
        onDone={() => setStreakConfetti(false)}
      />

      {/* Hero header */}
      <HeroHeader greeting="Dawa Zangu">
        <button
          type="button"
          aria-label={language === 'sw' ? 'Rudi' : 'Back'}
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {language === 'sw' ? 'Rudi' : 'Back'}
        </button>
      </HeroHeader>

      {/* Streak grid */}
      <StreakGrid completedDays={takenToday} totalDays={7} className="px-4 pt-4" />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" aria-live="polite">
          <div className="w-8 h-8 rounded-full border-4 border-[#0d9488] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Medication cards */}
      {!isLoading && (
        <div className="px-4 pt-5 space-y-3" aria-live="polite">
          {todaySchedule.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Pill className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">
                {language === 'sw' ? 'Hakuna dawa zilizoongezwa' : 'No medications added'}
              </p>
            </div>
          )}

          {todaySchedule.map((item, index) => {
            const cardKey = `${item.id}-${item.scheduledTime}`;
            const isPending = item.status === 'pending';
            const isTaken = item.status === 'taken';
            const isMissed = item.status === 'missed';

            const borderColor = isTaken
              ? 'border-l-[#16a34a]'
              : isMissed
              ? 'border-l-[#dc2626]'
              : 'border-l-[#f59e0b]';

            const bgColor = isTaken
              ? 'bg-[#f0fdf4]'
              : isMissed
              ? 'bg-[#fef2f2]'
              : 'bg-white';

            const badgeVariant = isTaken
              ? 'success'
              : isMissed
              ? 'danger'
              : 'warning';

            const badgeLabel = isTaken
              ? 'Imechukuliwa'
              : isMissed
              ? 'Umekosa'
              : 'Inangoja';

            const ariaLabel = `${item.name} ${item.dosage} — ${badgeLabel}`;

            return (
              <motion.div
                key={cardKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.06, ease: [0.2, 0, 0, 1] }}
                className={`rounded-2xl border-l-4 shadow-sm ${borderColor} ${bgColor}`}
                aria-label={ariaLabel}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: icon + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isTaken
                            ? 'bg-[#d1fae5]'
                            : isMissed
                            ? 'bg-[#fee2e2]'
                            : 'bg-[#fff7ed]'
                        }`}
                      >
                        <Pill
                          className="w-6 h-6"
                          style={{
                            color: isTaken ? '#16a34a' : isMissed ? '#dc2626' : '#f59e0b',
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a] truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.dosage}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{item.scheduledTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: badge + action */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge variant={badgeVariant} label={badgeLabel} />

                      {isPending && (
                        <AnimatedButton
                          type="button"
                          variant="primary"
                          size="sm"
                          aria-label={`Chukua ${item.name}`}
                          onClick={() => handleTake(item)}
                          className="min-w-[80px] min-h-[48px]"
                        >
                          Chukua
                        </AnimatedButton>
                      )}

                      {isTaken && (
                        <span className="text-xs font-semibold text-[#16a34a] min-h-[48px] flex items-center">
                          Imechukuliwa ✓
                        </span>
                      )}

                      {isMissed && (
                        <span className="text-xs font-semibold text-[#dc2626] min-h-[48px] flex items-center">
                          Umekosa dawa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
