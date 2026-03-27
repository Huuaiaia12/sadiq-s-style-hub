import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2, CheckCheck, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setNotifications(data as Notification[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("تم تعليم الكل كمقروء");
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("تم حذف التبليغ");
  };

  const deleteAll = async () => {
    if (notifications.length === 0) return;
    const ids = notifications.map((n) => n.id);
    await supabase.from("notifications").delete().in("id", ids);
    setNotifications([]);
    toast.success("تم حذف جميع التبليغات");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking": return "📅";
      case "order": return "🛒";
      case "booking_status": return "✅";
      default: return "🔔";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    const days = Math.floor(hrs / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">التبليغات</h1>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
            <CheckCheck className="w-4 h-4 ml-1" />
            قراءة الكل
          </Button>
          <Button variant="ghost" size="sm" onClick={deleteAll} className="text-xs text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 ml-1" />
            حذف الكل
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد تبليغات</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`rounded-xl border p-4 transition-colors ${
                  !notif.is_read ? "bg-accent/20 border-primary/20" : "bg-card border-border"
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{notif.title}</p>
                      {!notif.is_read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground/60">{timeAgo(notif.created_at)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notif.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Notifications;
