"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { Loader2, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm({ className, ...props }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values) {
    setFormError(null);
    const payload = { ...values, role: "employee" };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Login failed. Please check your credentials.");
        return;
      }

      setAuth(
        data.data.user,
        data.data.accessToken,
        data.data.refreshToken
      );
      router.push("/admin");
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center mb-8">
        <motion.h2 
          variants={itemVariants} 
          className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent"
        >
          Welcome Back
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-400 text-sm">
          Please enter your credentials to access the admin portal.
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence mode="wait">
            {formError && (
              <motion.div
                key="error"
                variants={shakeVariants}
                animate="shake"
                initial={{ opacity: 0, y: -10 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium text-center backdrop-blur-sm"
              >
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <Mail className="h-4.5 w-4.5" />
                        </span>
                        <Input
                          placeholder="admin@mobiking.com"
                          className="pl-10 h-11 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-500/45 focus-visible:border-indigo-500 rounded-xl transition-all duration-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs mt-1" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <Lock className="h-4.5 w-4.5" />
                        </span>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11 bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-500/45 focus-visible:border-indigo-500 rounded-xl transition-all duration-200"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs mt-1" />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 border-0"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}