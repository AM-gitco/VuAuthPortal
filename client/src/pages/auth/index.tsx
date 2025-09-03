import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { OtpForm } from '@/components/auth/OtpForm';
import { supabase } from '@/lib/supabase';

export function AuthPage() {
  const [activeForm, setActiveForm] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleSwitchToLogin = () => {
    setActiveForm('login');
  };

  const handleSwitchToSignup = () => {
    setActiveForm('signup');
  };

  const handleSwitchToForgot = () => {
    setActiveForm('forgot');
  };

  const handleSwitchToOTP = (email: string) => {
    setEmail(email);
    setActiveForm('otp');
  };

  const handleResendOtp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  const handleOtpSuccess = () => {
    setActiveForm('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-8 py-12 bg-white rounded-lg shadow-md">
        {activeForm === 'login' && (
          <LoginForm 
            onSwitchToSignup={handleSwitchToSignup} 
            onSwitchToForgotPassword={handleSwitchToForgot}
            onSwitchToOTP={handleSwitchToOTP}
          />
        )}
        {activeForm === 'signup' && (
          <SignupForm 
            onSwitchToLogin={handleSwitchToLogin} 
            onSwitchToOTP={handleSwitchToOTP}
          />
        )}
        {activeForm === 'forgot' && (
          <ForgotPasswordForm 
            onBackToLogin={handleSwitchToLogin}
          />
        )}
        {activeForm === 'otp' && (
          <OtpForm 
            email={email}
            onSuccess={handleOtpSuccess}
            onResend={handleResendOtp}
            onBack={handleSwitchToLogin}
          />
        )}
      </div>
    </div>
  );
}