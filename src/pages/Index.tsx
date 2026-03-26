import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronDown, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatusIndicator } from "@/components/StatusIndicator";
import { PointsCard } from "@/components/PointsCard";
import { HaircutCard } from "@/components/HaircutCard";
import { BookingModal } from "@/components/BookingModal";
import { Navigation } from "@/components/Navigation";
import { AdSlider } from "@/components/AdSlider";
import { ContactSection } from "@/components/ContactSection";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "@/components/NotificationBell";
import { ProductsSection } from "@/components/ProductsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

// Import images
import heroImage from "@/assets/hero-barber.jpg";
import fadeImage from "@/assets/haircut-fade.jpg";
import pompadourImage from "@/assets/haircut-pompadour.jpg";
import beardImage from "@/assets/haircut-beard.jpg";
import kidsImage from "@/assets/haircut-kids.jpg";
import skinfadeImage from "@/assets/haircut-skinfade.jpg";
import undercutImage from "@/assets/haircut-undercut.jpg";

const haircuts = [
  { name: "Fade + Beard", image: fadeImage, category: "رجالي" },
  { name: "Pompadour", image: pompadourImage, category: "رجالي" },
  { name: "تحديد اللحية", image: beardImage, category: "لحية" },
  { name: "قصّة أطفال", image: kidsImage, category: "أطفال" },
  { name: "Skin Fade", image: skinfadeImage, category: "رجالي" },
  { name: "Undercut", image: undercutImage, category: "رجالي" },
];

const Index = () => {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [isBarberOnline, setIsBarberOnline] = useState(true);

  // Fetch and subscribe to barber status
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("barber_status")
        .select("*")
        .limit(1)
        .single();
      
      if (data) {
        setIsBarberOnline(data.is_online);
      }
    };

    fetchStatus();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("barber-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "barber_status",
        },
        (payload) => {
          if (payload.new && typeof payload.new.is_online === "boolean") {
            setIsBarberOnline(payload.new.is_online);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sectionsRef = {
    home: useRef<HTMLDivElement>(null),
    booking: useRef<HTMLDivElement>(null),
    haircuts: useRef<HTMLDivElement>(null),
    points: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === "booking") {
      setIsBookingOpen(true);
    } else {
      sectionsRef[section as keyof typeof sectionsRef]?.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <h1 className="font-bold text-lg gold-text">حلاق صادق</h1>
              <p className="text-xs text-muted-foreground">Sadiq Barber</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <StatusIndicator isOnline={isBarberOnline} />
            <ThemeToggle />
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
                className="text-gold hover:text-gold/80"
              >
                <Shield className="w-5 h-5" />
              </Button>
            )}
            
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-gold">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                  <AvatarFallback className="bg-gold text-primary-foreground text-xs">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={sectionsRef.home} className="pt-20">
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={heroImage}
            alt="Sadiq Barber"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="container mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gold-text">أهلاً بك في</span>
                <br />
                متجر عجلة الحض
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                تجربة حلاقة فاخرة مع أحدث القصّات والتصاميم العصرية
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  className="gold-gradient text-primary-foreground font-bold py-6 px-8 text-lg glow-gold animate-pulse-gold"
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  احجز الآن
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>أقرب موعد: اليوم 6:00 م</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-gold animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 space-y-12 mt-8">
        {/* Ads Slider */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <AdSlider />
        </motion.section>

        {/* Points Section */}
        <section ref={sectionsRef.points}>
          <PointsCard />
        </section>

        {/* Haircuts Gallery */}
        <section ref={sectionsRef.haircuts} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold gold-text">القصّات المتاحة</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {haircuts.map((haircut, index) => (
              <HaircutCard
                key={haircut.name}
                name={haircut.name}
                image={haircut.image}
                category={haircut.category}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Products Section */}
        <ProductsSection />

        {/* Contact Section */}
        <section ref={sectionsRef.contact}>
          <ContactSection />
        </section>
      </main>

      {/* Navigation */}
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default Index;
