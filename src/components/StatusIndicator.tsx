import { motion } from "framer-motion";

interface StatusIndicatorProps {
  isOnline: boolean;
}

export const StatusIndicator = ({ isOnline }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`w-3 h-3 rounded-full ${
          isOnline ? "status-online" : "status-offline"
        }`}
      />
      <span className="text-sm font-medium text-muted-foreground">
        {isOnline ? "متواجد الآن" : "غير متواجد"}
      </span>
    </div>
  );
};
