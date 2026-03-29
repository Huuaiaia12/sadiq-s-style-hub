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
  const { user, loading, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isForgotPassword) {
      if (!email) { setError("يرجى إدخال البريد الإلكتروني"); return; }
      setIsSigningIn(true);
      const { error } = await resetPassword(email);
      if (error) setError(error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
      else setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      setIsSigningIn(false);
      return;
    }

    if (!email || !password) { setError("يرجى إدخال البريد الإلكتروني وكلمة المرور"); return; }

    if (isSignUp) {
      if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
      if (password !== confirmPassword) { setError("كلمة المرور غير متطابقة"); return; }
    }

    setIsSigningIn(true);
    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      if (error) setError(error.message || "حدث خطأ أثناء إنشاء الحساب");
      else setSuccessMsg("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-12">
          <Logo size="lg" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="glass-card p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {isForgotPassword ? "نسيت كلمة المرور" : isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </h2>
            <p className="text-muted-foreground">
              {isForgotPassword ? "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور" : isSignUp ? "أنشئ حسابك باستخدام البريد الإلكتروني" : "سجل دخولك باستخدام البريد الإلكتروني"}
            </p>
          </div>

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {successMsg && <Alert className="border-primary/50 bg-primary/10"><AlertDescription className="text-primary">{successMsg}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground" dir="ltr" />
            </div>

            {!isForgotPassword && (
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground" dir="ltr" />
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10 py-6 bg-secondary border-muted text-foreground placeholder:text-muted-foreground" dir="ltr" />
              </div>
            )}

            <Button type="submit" disabled={isSigningIn} className="w-full py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90">
              {isSigningIn ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <ArrowRight className="w-5 h-5 ml-2" />}
              {isSigningIn ? "جاري المعالجة..." : isForgotPassword ? "إرسال رابط إعادة التعيين" : isSignUp ? "إنشاء الحساب" : "تسجيل الدخول"}
            </Button>

            {!isForgotPassword && !isSignUp && (
              <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMsg(null); }} className="w-full text-center text-xs text-muted-foreground hover:text-primary">
                نسيت كلمة المرور؟
              </button>
            )}

            {!isForgotPassword && (
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }} className="w-full text-center text-sm text-primary hover:underline">
                {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حساباً جديداً"}
              </button>
            )}

            {isForgotPassword && (
              <button type="button" onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMsg(null); }} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                العودة لتسجيل الدخول
              </button>
            )}
          </form>

          <p className="text-center text-xs text-muted-foreground">
            بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="text-center text-sm text-muted-foreground mt-8">
          متجر عجلة الحض - خدمة حلاقة فاخرة
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
