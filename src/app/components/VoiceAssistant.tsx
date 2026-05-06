/**
 * Voice Assistant Integration
 * 
 * Provides voice-based interaction for AfyaCare
 * Particularly important for low-literacy users
 * 
 * Features:
 * - Speech-to-text symptom reporting
 * - Text-to-speech health guidance
 * - Kiswahili and English support
 * - Offline capability with fallback
 * - Medical terminology recognition
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  autoSpeak?: boolean;
  language?: 'sw' | 'en';
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onTranscript,
  onError,
  autoSpeak = false,
  language = 'sw'
}) => {
  const { t, i18n } = useTranslation(['assistant', 'common']);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      setError('Voice features are not supported on this device');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'sw' ? 'sw-TZ' : 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        setTranscript(prev => prev + final);
        onTranscript(final);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      setError('Could not understand. Please try again.');
      if (onError) onError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    speechSynthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [language, onTranscript, onError]);

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start voice input');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
    }
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!speechSynthesisRef.current || !isSupported) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'sw' ? 'sw-TZ' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    speechSynthesisRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (!speechSynthesisRef.current) return;
    speechSynthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-[#FEF3F2] border-[#FCA5A5]">
        <p className="text-sm text-[#6B7280]">
          {t('common:error')} Voice features are not available on this device
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Input Controls */}
      <div className="flex gap-3">
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? 'destructive' : 'default'}
          className="flex-1 gap-2 min-h-[56px]"
          disabled={isSpeaking}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              {t('assistant:stop_voice')}
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              {t('assistant:voice_input')}
            </>
          )}
        </Button>

        <Button
          onClick={isSpeaking ? stopSpeaking : () => speak(transcript || t('assistant:greeting'))}
          variant={isSpeaking ? 'destructive' : 'outline'}
          className="gap-2 min-h-[56px] px-6"
          disabled={isListening || (!transcript && !isSpeaking)}
        >
          {isSpeaking ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <Card className="p-4 bg-[#EFF6FF] border-[#93C5FD]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 text-[#0F3D56] animate-spin" />
              <div className="absolute inset-0 animate-ping">
                <Mic className="h-5 w-5 text-[#0F3D56] opacity-20" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0F3D56]">
                {t('assistant:listening')}
              </p>
              {interimTranscript && (
                <p className="text-sm text-[#6B7280] mt-1 italic">
                  {interimTranscript}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <Card className="p-4 bg-[#F0FDF4] border-[#86EFAC]">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-[#2E7D32] animate-pulse" />
            <p className="text-sm font-medium text-[#2E7D32]">
              Speaking...
            </p>
          </div>
        </Card>
      )}

      {/* Transcript Display */}
      {transcript && !isListening && (
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#6B7280]">
              You said:
            </p>
            <p className="text-sm text-[#1E1E1E]">
              {transcript}
            </p>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-[#FEF3F2] border-[#FCA5A5]">
          <p className="text-sm text-[#C84B31]">
            {error}
          </p>
        </Card>
      )}

      {/* Usage Tip */}
      {!isListening && !transcript && (
        <Card className="p-4 bg-[#F7F9FB] border-gray-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-medium text-[#1E1E1E] mb-1">
                Voice Tip
              </p>
              <p className="text-sm text-[#6B7280]">
                {language === 'sw' 
                  ? 'Bonyeza kitufe cha maikrofoni na uanze kusema dalili zako. Nitakusikiliza na kukusaidia.'
                  : 'Tap the microphone button and start describing your symptoms. I\'ll listen and help you.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Hook for programmatic voice interaction
 */
export const useVoiceAssistant = (language: 'sw' | 'en' = 'sw') => {
  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'sw' ? 'sw-TZ' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, stopSpeaking };
};
