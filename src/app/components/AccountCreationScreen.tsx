import React, { useState } from 'react';
import { Mail, Phone, Lock, Eye, EyeOff, ChevronRight, Shield, Fingerprint } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';

const translations = {
  sw: {
    title: 'Unda Akaunti Yako',
    subtitle: 'Anza safari yako ya afya bora',
    phoneLabel: 'Namba ya Simu',
    emailLabel: 'Barua pepe (hiari)',
    passwordLabel: 'Nenosiri',
    confirmPasswordLabel: 'Thibitisha Nenosiri',
    phonePlaceholder: '+255 XXX XXX XXX',
    emailPlaceholder: 'mfano@email.com',
    passwordPlaceholder: 'Angalau herufi 8',
    orContinueWith: 'Au endelea na',
    googleSignIn: 'Endelea na Google',
    appleSignIn: 'Endelea na Apple',
    biometricSetup: 'Weka Kitambulisho cha Kidole/Uso',
    biometricDescription: 'Ingia kwa haraka zaidi kutumia kitambulisho chako cha kidole au uso',
    privacyNotice: 'Taarifa zako zimehifadhiwa salama',
    privacyDescription: 'Tunafuata sheria za PDPA na TMDA kwa usalama wa data yako',
    agreeToTerms: 'Ninakubali',
    termsLink: 'Masharti ya Matumizi',
    and: 'na',
    privacyLink: 'Sera ya Faragha',
    createAccount: 'Unda Akaunti',
    alreadyHaveAccount: 'Tayari una akaunti?',
    signIn: 'Ingia',
  },
  en: {
    title: 'Create Your Account',
    subtitle: 'Start your journey to better health',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email (Optional)',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    phonePlaceholder: '+255 XXX XXX XXX',
    emailPlaceholder: 'example@email.com',
    passwordPlaceholder: 'At least 8 characters',
    orContinueWith: 'Or continue with',
    googleSignIn: 'Continue with Google',
    appleSignIn: 'Continue with Apple',
    biometricSetup: 'Setup Fingerprint/Face ID',
    biometricDescription: 'Sign in faster using your fingerprint or face',
    privacyNotice: 'Your data is protected',
    privacyDescription: 'We comply with PDPA and TMDA regulations for your data security',
    agreeToTerms: 'I agree to the',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
  },
};

interface AccountCreationScreenProps {
  onComplete: (data: {
    phone: string;
    email?: string;
    biometricEnabled: boolean;
    consented: boolean;
  }) => void;
  language: 'sw' | 'en';
}

export function AccountCreationScreen({ onComplete, language }: AccountCreationScreenProps) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && password && password === confirmPassword && agreedToTerms) {
      onComplete({
        phone,
        email: email || undefined,
        biometricEnabled,
        consented: agreedToTerms,
      });
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Simulate social login
    onComplete({
      phone: '',
      biometricEnabled: false,
      consented: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--onboarding-bg)' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--onboarding-text-primary)' }}>
            {t.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--onboarding-text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto px-6 py-8">
          {/* Privacy Notice */}
          <div
            className="mb-8 p-4 rounded-xl slide-in"
            style={{ background: 'var(--onboarding-primary-bg)' }}
          >
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 flex-shrink-0" style={{ color: 'var(--onboarding-primary)' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--onboarding-primary)' }}>
                  {t.privacyNotice}
                </h3>
                <p className="text-sm" style={{ color: 'var(--onboarding-text-secondary)' }}>
                  {t.privacyDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Account Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block font-medium" style={{ color: 'var(--onboarding-text-primary)' }}>
                {t.phoneLabel} *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                  style={{ color: 'var(--onboarding-text-tertiary)' }}
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="pl-12 py-6 text-base"
                  required
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <label className="block font-medium" style={{ color: 'var(--onboarding-text-primary)' }}>
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                  style={{ color: 'var(--onboarding-text-tertiary)' }}
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="pl-12 py-6 text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block font-medium" style={{ color: 'var(--onboarding-text-primary)' }}>
                {t.passwordLabel} *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                  style={{ color: 'var(--onboarding-text-tertiary)' }}
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="pl-12 pr-12 py-6 text-base"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: 'var(--onboarding-text-tertiary)' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: 'var(--onboarding-text-tertiary)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block font-medium" style={{ color: 'var(--onboarding-text-primary)' }}>
                {t.confirmPasswordLabel} *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                  style={{ color: 'var(--onboarding-text-tertiary)' }}
                />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="pl-12 pr-12 py-6 text-base"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: 'var(--onboarding-text-tertiary)' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: 'var(--onboarding-text-tertiary)' }} />
                  )}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">
                  {language === 'sw' ? 'Nenosiri hazifanani' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Biometric Setup */}
            <div
              className="p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-solid"
              style={{
                borderColor: biometricEnabled
                  ? 'var(--onboarding-primary)'
                  : 'var(--onboarding-text-tertiary)',
                background: biometricEnabled
                  ? 'var(--onboarding-primary-bg)'
                  : 'transparent',
              }}
              onClick={() => setBiometricEnabled(!biometricEnabled)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-full"
                  style={{
                    background: biometricEnabled
                      ? 'var(--onboarding-primary)'
                      : 'var(--onboarding-bg)',
                  }}
                >
                  <Fingerprint
                    className="h-6 w-6"
                    style={{
                      color: biometricEnabled ? 'white' : 'var(--onboarding-text-tertiary)',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--onboarding-text-primary)' }}>
                    {t.biometricSetup}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--onboarding-text-secondary)' }}>
                    {t.biometricDescription}
                  </p>
                </div>
                <Checkbox checked={biometricEnabled} />
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm" style={{ color: 'var(--onboarding-text-secondary)' }}>
                {t.agreeToTerms}{' '}
                <button
                  type="button"
                  className="font-medium underline"
                  style={{ color: 'var(--onboarding-primary)' }}
                >
                  {t.termsLink}
                </button>{' '}
                {t.and}{' '}
                <button
                  type="button"
                  className="font-medium underline"
                  style={{ color: 'var(--onboarding-primary)' }}
                >
                  {t.privacyLink}
                </button>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!phone || !password || password !== confirmPassword || !agreedToTerms}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--gradient-trust)',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{t.createAccount}</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: 'var(--onboarding-text-tertiary)' }} />
            <span className="text-sm" style={{ color: 'var(--onboarding-text-secondary)' }}>
              {t.orContinueWith}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--onboarding-text-tertiary)' }} />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-xl font-medium hover:border-gray-400 transition-all flex items-center justify-center gap-3"
              style={{ color: 'var(--onboarding-text-primary)' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.googleSignIn}
            </button>

            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-full py-4 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {t.appleSignIn}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: 'var(--onboarding-text-secondary)' }}>
              {t.alreadyHaveAccount}{' '}
              <button className="font-semibold" style={{ color: 'var(--onboarding-primary)' }}>
                {t.signIn}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
