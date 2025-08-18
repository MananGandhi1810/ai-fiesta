'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { signIn } from '@/lib/auth-client';
import { Loader2, Mail } from 'lucide-react';

export function OTPForm({ email, onBack }) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn.emailOtp({ email, otp });
      if (result.error) {
        setError(result.error.message || 'Invalid code');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/email-otp/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'sign-in' }),
      });
      if (response.ok) {
        setCanResend(false);
        setCountdown(60);
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Enter Sign-In Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-gray-600">
          <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          We've sent a 6-digit code to
          <div className="font-medium">{email}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-xl tracking-widest"
              maxLength={6}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : 'Verify Code'}
          </Button>
        </form>
        <div className="text-center space-y-2">
          {canResend ? (
            <button type="button" onClick={handleResend} className="text-sm text-blue-600 hover:underline" disabled={isLoading}>Resend code</button>
          ) : (
            <div className="text-sm text-gray-500">Resend code in {countdown}s</div>
          )}
          <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline block">← Back to login</button>
        </div>
      </CardContent>
    </Card>
  );
}
