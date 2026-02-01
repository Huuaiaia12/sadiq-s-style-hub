import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Scissors, Phone, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const haircutTypes = [
  "Fade + Beard",
  "Classic Cut",
  "Skin Fade",
  "Buzz Cut",
  "Pompadour",
  "تحديد اللحية فقط",
];

const timeSlots = [
  "10:00 ص",
  "11:00 ص",
  "12:00 م",
  "2:00 م",
  "3:00 م",
  "4:00 م",
  "5:00 م",
  "6:00 م",
  "7:00 م",
  "8:00 م",
];

export const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
    setPhone("");
    setNotes("");
    setIsSubmitted(false);
    onClose();
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: date.toLocaleDateString("ar-SA", { weekday: "short" }),
        date: date.getDate(),
        full: date.toISOString().split("T")[0],
      });
    }
    return dates;
  };

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
                  {[1, 2, 3].map((s) => (
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
                          اختر التاريخ
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {generateDates().map((d) => (
                            <button
                              key={d.full}
                              onClick={() => setSelectedDate(d.full)}
                              className={`p-3 rounded-xl text-center transition-all ${
                                selectedDate === d.full
                                  ? "gold-gradient text-primary-foreground"
                                  : "bg-secondary hover:bg-muted"
                              }`}
                            >
                              <div className="text-xs mb-1">{d.day}</div>
                              <div className="font-bold">{d.date}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                          <Clock className="w-4 h-4 text-gold" />
                          اختر الوقت
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-2 rounded-lg text-sm transition-all ${
                                selectedTime === time
                                  ? "gold-gradient text-primary-foreground"
                                  : "bg-secondary hover:bg-muted"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => setStep(2)}
                        disabled={!selectedDate || !selectedTime}
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
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                          <Scissors className="w-4 h-4 text-gold" />
                          نوع القصّة
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {haircutTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => setSelectedType(type)}
                              className={`p-4 rounded-xl text-sm transition-all ${
                                selectedType === type
                                  ? "gold-gradient text-primary-foreground"
                                  : "bg-secondary hover:bg-muted"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1 py-6"
                        >
                          السابق
                        </Button>
                        <Button
                          onClick={() => setStep(3)}
                          disabled={!selectedType}
                          className="flex-1 gold-gradient text-primary-foreground font-bold py-6"
                        >
                          التالي
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                          <Phone className="w-4 h-4 text-gold" />
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="07xxxxxxxx"
                          className="w-full p-4 rounded-xl bg-secondary border border-border focus:border-gold outline-none transition-colors"
                          dir="ltr"
                        />
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
                          onClick={() => setStep(2)}
                          className="flex-1 py-6"
                        >
                          السابق
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!phone}
                          className="flex-1 gold-gradient text-primary-foreground font-bold py-6"
                        >
                          تأكيد الحجز
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
                    <span>التاريخ: {selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>الوقت: {selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Scissors className="w-5 h-5 text-gold" />
                    <span>نوع القصّة: {selectedType}</span>
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
