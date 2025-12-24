"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Login and wait for it to complete
      await login({ username, password });

      // Show success message
      toast.success('Login successful');

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-gray-900 dark:border-gray-700">

        {/* Accent bar */}
        <div className="h-2 bg-gradient-to-r from-[oklch(0.80_0.18_158)] [oklch(0.80_0.18_158)] rounded-t-2xl" />

        <CardHeader className="pt-10 pb-6 text-center space-y-3">
          <CardTitle className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400 text-base">
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-100/70 
                       border border-red-200 rounded-lg dark:text-red-400 dark:bg-red-900/20 
                       dark:border-red-800"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="
                pl-12 h-14 rounded-xl text-base 
                bg-gray-50 dark:bg-gray-800 
                border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-blue-500
              "
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                pl-12 pr-12 h-14 rounded-xl text-base
                bg-gray-50 dark:bg-gray-800 
                border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-blue-500
              "
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                absolute right-4 top-1/2 -translate-y-1/2 
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              "
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="
            w-full h-14 rounded-xl text-lg font-medium text-white
            bg-gradient-to-r from-[oklch(0.80_0.18_158)] to-[oklch(0.80_0.18_158)]
            hover:[oklch(0.80_0.18_158)] hover:to-[oklch(0.80_0.18_158)]
            transition-all duration-200 shadow-lg 
            hover:shadow-xl hover:scale-[1.015]
          "
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </motion.div>


  );
}