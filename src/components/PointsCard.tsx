import { motion } from "framer-motion";
import { Star, Gift } from "lucide-react";

interface PointsCardProps {
  points: number;
}

export const PointsCard = ({ points }: PointsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 card-3d"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
            <Star className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">نقاطك المكتسبة</p>
            <p className="text-3xl font-bold gold-text">{points}</p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary cursor-pointer"
        >
          <Gift className="w-4 h-4 text-gold" />
          <span className="text-sm">استبدال</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
