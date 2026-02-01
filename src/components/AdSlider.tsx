import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Gift, Percent, Bell } from "lucide-react";

const ads = [
  {
    id: 1,
    title: "عرض نهاية الأسبوع",
    description: "خصم 20% على جميع القصّات",
    icon: Percent,
    gradient: "from-gold to-gold-dark",
  },
  {
    id: 2,
    title: "اجمع النقاط",
    description: "كل 5 حجوزات = حجز مجاني",
    icon: Gift,
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    id: 3,
    title: "جديد!",
    description: "خدمة العناية بالبشرة متوفرة الآن",
    icon: Bell,
    gradient: "from-purple-500 to-purple-700",
  },
];

export const AdSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % ads.length);
  const prev = () => setCurrent((prev) => (prev - 1 + ads.length) % ads.length);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className={`relative p-6 bg-gradient-to-r ${ads[current].gradient}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              {(() => {
                const Icon = ads[current].icon;
                return <Icon className="w-7 h-7 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{ads[current].title}</h3>
              <p className="text-white/80">{ads[current].description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {ads.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
