import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { otpSchema, type OtpData } from "@shared/schema";

export function OtpForm({ 
  email, 
  onSuccess,
  onResend,
  onBack
}: {
  email: string;
  onSuccess: () => void;
  onResend: () => Promise<void>;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email,
      token: "",
    },
  });

  const handleVerify = async (data: OtpData) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.verifyOtp({
        email: data.email,
        token: data.token,
        type: 'email'
      });

      if (error) throw error;
      
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await onResend();
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="text-blue-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    icon={<LockKeyhole className="text-gray-400" size={18} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Account"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Login
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}