import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

interface HaircutCardProps {
  name: string;
  image: string;
  category: string;
  index: number;
}

export const HaircutCard = ({ name, image, category, index }: HaircutCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -10,
        rotateY: 5,
        rotateX: 5,
      }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border cursor-pointer"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Scissors className="w-4 h-4 text-gold" />
          <span className="text-xs text-gold uppercase tracking-wider">{category}</span>
        </div>
        <h3 className="text-lg font-bold">{name}</h3>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 border-2 border-gold rounded-2xl pointer-events-none"
      />
    </motion.div>
  );
};
