'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { OTPForm } from './OTPForm';
import { useRouter } from 'next/navigation';
import { useAuthSession } from './SessionProvider';

export function AuthContainer() {
  const router = useRouter();
  const { session, isPending } = useAuthSession();
  const [currentView, setCurrentView] = useState('login');
  const [otpEmail, setOtpEmail] = useState('');

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace('/');
    }
  }, [isPending, session, router]);

  if (!isPending && session?.user) {
    return null;
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)',backgroundSize:'48px 48px'}} />
      {/* Content */}
      <div className="relative w-full max-w-md px-4 sm:px-0 py-12">
        {currentView === 'login' && (
          <LoginForm 
            onSwitchToSignup={() => setCurrentView('signup')}
            onSwitchToOTP={(email) => { setOtpEmail(email); setCurrentView('otp'); }}
          />
        )}
        {currentView === 'signup' && (
          <SignupForm onSwitchToLogin={() => setCurrentView('login')} />
        )}
        {currentView === 'otp' && (
          <OTPForm email={otpEmail} onBack={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  );
}
