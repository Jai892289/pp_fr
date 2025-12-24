'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation";
import { decrypt } from '@/lib/hashEncrypt'

export default function CitizenLogin() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    const { citizenLogin } = useAuth();
    const searchParams = useSearchParams();

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (phoneNumber.length >= 10) {
            setIsLoading(true)
            // Simulate sending OTP
            setTimeout(() => {
                setIsLoading(false)
                setStep('otp')
            }, 1000)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length === 6) {
            setIsLoading(true)

            try {
                await citizenLogin({ contact_no: phoneNumber, otp: otp });

                // Redirect to dashboard
                router.push('/dashboard');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.';
                alert(errorMessage)
            } finally {
                setIsLoading(false);
            }

        }
    }

    const handleBackToPhone = () => {
        setStep('phone')
        setOtp('')
    }

    useEffect(() => {
        const mobile = searchParams.get("mobile");
        if (mobile) {
            const decryptedData = decrypt(mobile)
            setPhoneNumber(String(decryptedData))
            setStep('otp')
        }
    }, [])

    return (
        <div className="w-full h-screen px-4 flex justify-center items-center">
            <Card className="p-8 bg-card border border-border max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Citizen Login</h1>
                    <p className="text-sm text-muted-foreground">
                        {step === 'phone'
                            ? 'Enter your mobile number to proceed'
                            : 'Enter the OTP sent to your phone'}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2 mb-8">
                    <div
                        className={`flex-1 h-1 rounded-full transition-all ${step === 'phone' || step === 'otp'
                            ? 'bg-primary'
                            : 'bg-muted'
                            }`}
                    />
                    <div
                        className={`flex-1 h-1 rounded-full transition-all ${step === 'otp' ? 'bg-primary' : 'bg-muted'
                            }`}
                    />
                </div>

                {/* Phone Number Step */}
                {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                Mobile Number
                            </label>
                            <div className="flex gap-2">
                                <div className="flex items-center px-3 py-3 border border-border rounded-lg bg-muted/30">
                                    <span className="text-foreground font-medium">+91</span>
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your 10-digit number"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                                    }
                                    className="flex-1 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    maxLength={10}
                                />
                            </div>
                            {phoneNumber.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {10 - phoneNumber.length} more digits needed
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={phoneNumber.length < 10 || isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* OTP Step */}
                {step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                                One-Time Password
                            </label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                maxLength={6}
                            />
                            {otp.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {6 - otp.length} more digits needed
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={otp.length < 6 || isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={handleBackToPhone}
                            className="w-full py-3 px-4 bg-muted text-muted-foreground font-semibold rounded-lg hover:bg-muted/80 transition-all"
                        >
                            Back to Phone Number
                        </button>

                        <p className="text-center text-xs text-muted-foreground">
                            {`Didn't receive OTP?`} <button type="button" className="text-primary hover:underline font-medium">Resend</button>
                        </p>
                    </form>
                )}
            </Card>
        </div>
    )
}
