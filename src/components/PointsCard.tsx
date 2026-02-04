import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Gift, History, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PointsCard = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPoints();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('points-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && typeof payload.new === 'object' && 'points' in payload.new) {
              setPoints((payload.new as { points: number }).points || 0);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPoints = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setPoints(data?.points || 0);
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            ) : (
              <p className="text-3xl font-bold gold-text">{points}</p>
            )}
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

      {/* Points info */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <History className="w-3 h-3" />
          <span>تحصل على نقاط عند إتمام كل حجز</span>
        </div>
      </div>
    </motion.div>
  );
};
