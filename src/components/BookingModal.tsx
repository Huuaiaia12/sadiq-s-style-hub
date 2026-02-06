import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MessageSquare, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTimeSlots();
    }
  }, [isOpen]);

  const fetchTimeSlots = async () => {
    setLoadingSlots(true);
    try {
      // Use local date to avoid timezone issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const today = `${year}-${month}-${day}`;
      
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("is_available", true)
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب المواعيد المتاحة",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedSlot) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          time_slot_id: selectedSlot.id,
          service_type: "حجز موعد",
          notes: notes || null,
          status: "pending",
        });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال طلب الحجز بنجاح",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال طلب الحجز",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setNotes("");
    setIsSubmitted(false);
    onClose();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE d MMMM", { locale: ar });
  };

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
          >
            {!isSubmitted ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gold-text">احجز موعدك</h2>
                  <button
                    onClick={resetAndClose}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        s <= step ? "bg-gold" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                          <Calendar className="w-4 h-4 text-gold" />
                          اختر الموعد المتاح
                        </label>
                        
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gold animate-spin" />
                          </div>
                        ) : Object.keys(slotsByDate).length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>لا توجد مواعيد متاحة حالياً</p>
                            <p className="text-sm mt-2">يرجى التحقق لاحقاً</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(slotsByDate).map(([date, slots]) => (
                              <div key={date} className="space-y-2">
                                <h3 className="text-sm font-medium text-gold">
                                  {formatDate(date)}
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                  {slots.map((slot) => (
                                    <button
                                      key={slot.id}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`p-3 rounded-xl text-center transition-all ${
                                        selectedSlot?.id === slot.id
                                          ? "gold-gradient text-primary-foreground"
                                          : "bg-secondary hover:bg-muted"
                                      }`}
                                    >
                                      <Clock className="w-4 h-4 mx-auto mb-1" />
                                      <div className="text-sm font-medium">
                                        {formatTime(slot.start_time)}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => setStep(2)}
                        disabled={!selectedSlot}
                        className="w-full gold-gradient text-primary-foreground font-bold py-6"
                      >
                        التالي
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Booking Summary */}
                      <div className="glass-card p-4 space-y-3">
                        <h3 className="font-medium gold-text">ملخص الحجز</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-gold" />
                          <span>{selectedSlot && formatDate(selectedSlot.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-gold" />
                          <span>{selectedSlot && formatTime(selectedSlot.start_time)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                          <MessageSquare className="w-4 h-4 text-gold" />
                          ملاحظات (اختياري)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="أي ملاحظات إضافية..."
                          className="w-full p-4 rounded-xl bg-secondary border border-border focus:border-gold outline-none transition-colors resize-none h-24"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1 py-6"
                          disabled={isLoading}
                        >
                          السابق
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="flex-1 gold-gradient text-primary-foreground font-bold py-6"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "تأكيد الحجز"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-2">تم إرسال طلب الحجز!</h3>
                <p className="text-muted-foreground mb-6">بانتظار موافقة الإدارة ⏳</p>

                <div className="glass-card p-6 text-right space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gold" />
                    <span>التاريخ: {selectedSlot && formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>الوقت: {selectedSlot && formatTime(selectedSlot.start_time)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  🎁 ستحصل على نقاط بعد إتمام الحجز
                </p>

                <Button onClick={resetAndClose} className="w-full gold-gradient text-primary-foreground font-bold py-6">
                  تم
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};