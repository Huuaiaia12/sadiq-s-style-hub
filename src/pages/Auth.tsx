import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Phone, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, signUpWithPhone, signInWithPhone } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const formatPhone = (input: string): string => {
    let cleaned = input.replace(/[^\d+]/g, "");
    // If starts with 07, convert to +964 format
    if (cleaned.startsWith("07")) {
      cleaned = "+964" + cleaned.slice(1);
    }
    // If starts with 964, add +
    if (cleaned.startsWith("964")) {
      cleaned = "+" + cleaned;
    }
    // If no + prefix and not starting with 0, assume Iraqi number
    if (!cleaned.startsWith("+") && cleaned.length >= 10) {
      cleaned = "+964" + cleaned;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!phone || !password) {
      setError("يرجى إدخال رقم الهاتف وكلمة المرور");
      return;
    }

    const formattedPhone = formatPhone(phone);
    if (!formattedPhone.startsWith("+") || formattedPhone.length < 10) {
      setError("يرجى إدخال رقم هاتف صحيح (مثال: 07xxxxxxxxx)");
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
      const { error } = await signUpWithPhone(formattedPhone, password);
      if (error) {
        setError(error.message || "حدث خطأ أثناء إنشاء الحساب");
      } else {
        setSuccessMsg("تم إنشاء الحساب بنجاح!");
      }
    } else {
      const { error } = await signInWithPhone(formattedPhone, password);
      if (error) {
        setError("رقم الهاتف أو كلمة المرور غير صحيحة");
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
              {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp
                ? "أنشئ حسابك باستخدام رقم الهاتف"
                : "سجل دخولك باستخدام رقم الهاتف"}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="رقم الهاتف (مثال: 07xxxxxxxxx)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
          </form>

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
