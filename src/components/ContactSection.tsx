import { motion } from "framer-motion";
import { Phone, MessageCircle, Instagram, Facebook } from "lucide-react";

const contactLinks = [
  {
    icon: Phone,
    label: "اتصال مباشر",
    value: "+964 XXX XXX XXXX",
    href: "tel:+964XXXXXXXXXX",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    label: "واتساب",
    value: "تواصل معنا",
    href: "https://wa.me/964XXXXXXXXXX",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Instagram,
    label: "إنستغرام",
    value: "@rio_b9",
    href: "https://www.instagram.com/rio_b9?igsh=cThieGNyaXRkNG0z",
    color: "from-pink-500 to-purple-600",
  },
  {
    icon: Facebook,
    label: "فيسبوك",
    value: "حلاق صادق",
    href: "https://www.facebook.com/share/174VnW9waS/",
    color: "from-blue-600 to-blue-700",
  },
];

export const ContactSection = () => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-center gold-text"
      >
        تواصل معنا
      </motion.h2>

      <div className="grid grid-cols-2 gap-4">
        {contactLinks.map((link, index) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`glass-card p-4 flex flex-col items-center gap-3 group`}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${link.color} flex items-center justify-center`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <p className="font-medium">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.value}</p>
            </div>
          </motion.a>
        ))}
      </div>

    </div>
  );
};
