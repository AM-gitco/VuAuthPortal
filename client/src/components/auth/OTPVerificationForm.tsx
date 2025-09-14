import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { otpVerificationSchema, type OTPVerificationData } from "@shared/schema";
import { useLocation } from "wouter";

interface OTPVerificationFormProps {
  email: string;
  fromSignup?: boolean;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToResetPassword?: (email: string, code: string) => void;
}

export function OTPVerificationForm({ email, fromSignup = false, onSwitchToLogin, onSwitchToSignup, onSwitchToForgotPassword, onSwitchToResetPassword }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<OTPVerificationData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: OTPVerificationData) => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Verified Successfully",
        description: "Your account has been created. Redirecting to setup your profile...",
      });
      setLocation("/dashboard/setup-profile");
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive",
      });
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      verifyMutation.mutate({ email, code: token });
    }
  }, [email, verifyMutation]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== "")) {
      const otpCode = newOtp.join("");
      form.setValue("code", otpCode);
      verifyMutation.mutate({ email, code: otpCode });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Smartphone className="text-green-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
        <p className="text-gray-500 mb-2">We've sent a 6-digit code to</p>
        <p className="text-blue-600 font-semibold">{email}</p>
        <p className="text-gray-500 mb-2">Or check your email for a magic link.</p>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <FormLabel className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Verification Code
            </FormLabel>
            <div className="flex space-x-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <Button
            type="button"
            variant="success"
            className="w-full"
            disabled={verifyMutation.isPending || otp.some(digit => digit === "")}
            onClick={() => {
              const otpCode = otp.join("");
              if (otpCode.length === 6) {
                verifyMutation.mutate({ email, code: otpCode });
              }
            }}
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Code"}
            <Check className="ml-2" size={16} />
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <button
          onClick={fromSignup ? onSwitchToSignup : onSwitchToForgotPassword}
          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors flex items-center justify-center w-full"
        >
          <ArrowLeft className="mr-2" size={16} />
          {fromSignup ? "Back to Sign Up" : "Back to Reset Password"}
        </button>
      </div>
    </div>
  );
}
