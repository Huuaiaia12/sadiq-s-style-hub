import { motion } from "framer-motion";
import { Phone, MessageCircle, Instagram, Facebook, MapPin } from "lucide-react";

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
    value: "@sadiq_barber",
    href: "https://instagram.com/sadiq_barber",
    color: "from-pink-500 to-purple-600",
  },
  {
    icon: Facebook,
    label: "فيسبوك",
    value: "Sadiq Barber",
    href: "https://facebook.com/sadiqbarber",
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass-card p-4 overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-gold" />
          <span className="font-medium">متجر عجلة الحض</span>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.846!2d44.366!3d33.312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDE4JzQzLjIiTiA0NMKwMjEnNTcuNiJF!5e0!3m2!1sen!2siq!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع المتجر"
          />
        </div>
      </motion.div>
    </div>
  );
};
