import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      setIsSigningIn(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isForgotPassword) {
      if (!email) {
        setError("يرجى إدخال البريد الإلكتروني");
        return;
      }
      setIsSigningIn(true);
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
      } else {
        setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      }
      setIsSigningIn(false);
      return;
    }

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمة المرور غير متطابقة");
        return;
      }
    }

    setIsSigningIn(true);

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setError(error.message || "حدث خطأ أثناء إنشاء الحساب");
      } else {
        setSuccessMsg("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.");
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    }

    setIsSigningIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6" dir="rtl">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {isEmailMode ? (isForgotPassword ? "نسيت كلمة المرور" : isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول") : "مرحباً بك"}
            </h2>
            <p className="text-muted-foreground">
              {isEmailMode
                ? isForgotPassword
                  ? "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"
                  : isSignUp
                  ? "أنشئ حسابك باستخدام البريد الإلكتروني"
                  : "سجل دخولك باستخدام البريد الإلكتروني"
                : "سجل دخولك للاستمتاع بخدماتنا المميزة"}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="border-primary/50 bg-primary/10">
              <AlertDescription className="text-primary">{successMsg}</AlertDescription>
            </Alert>
          )}

          {!isEmailMode ? (
            <div className="space-y-4">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-6 text-lg bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              >
                {isSigningIn ? (
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {isSigningIn ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-muted" />
                <span className="text-muted-foreground text-sm">أو</span>
                <div className="flex-1 h-px bg-muted" />
              </div>

              {/* Email Option */}
              <Button
                onClick={() => setIsEmailMode(true)}
                variant="outline"
                className="w-full py-6 text-lg border-muted-foreground/30"
              >
                <Mail className="w-5 h-5 ml-2" />
                المتابعة بالبريد الإلكتروني
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground"
                    dir="ltr"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSigningIn ? (
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 ml-2" />
                )}
                {isSigningIn
                  ? "جاري المعالجة..."
                  : isSignUp
                  ? "إنشاء الحساب"
                  : "تسجيل الدخول"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حساباً جديداً"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEmailMode(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                العودة لخيارات تسجيل الدخول
              </button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          متجر عجلة الحض - خدمة حلاقة فاخرة
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
