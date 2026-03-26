
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;

CREATE OR REPLACE FUNCTION public.notify_user_on_booking_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_text TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN status_text := 'تم تأكيد حجزك';
      WHEN 'cancelled' THEN status_text := 'تم إلغاء حجزك';
      WHEN 'completed' THEN status_text := 'تم إكمال حجزك';
      ELSE status_text := 'تم تحديث حالة حجزك إلى: ' || NEW.status;
    END CASE;
    
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (NEW.user_id, 'تحديث الحجز', status_text, 'booking_status', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_status_change
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_on_booking_status();
