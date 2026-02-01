import { motion } from "framer-motion";
import { Home, Calendar, Scissors, Phone, Star } from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "الرئيسية" },
  { id: "booking", icon: Calendar, label: "الحجز" },
  { id: "haircuts", icon: Scissors, label: "القصّات" },
  { id: "points", icon: Star, label: "النقاط" },
  { id: "contact", icon: Phone, label: "تواصل" },
];

export const Navigation = ({ activeSection, onNavigate }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 z-40 glass-card p-2"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
              activeSection === item.id
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeSection === item.id && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-gold/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2 }}
              />
            )}
            <item.icon className="w-5 h-5 relative z-10" />
            <span className="text-xs font-medium relative z-10">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};
