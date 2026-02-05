-- Create barber_status table to store online/offline status
CREATE TABLE public.barber_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_online boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.barber_status ENABLE ROW LEVEL SECURITY;

-- Anyone can view the status
CREATE POLICY "Anyone can view barber status"
ON public.barber_status
FOR SELECT
USING (true);

-- Only admins can update the status
CREATE POLICY "Admins can update barber status"
ON public.barber_status
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert status
CREATE POLICY "Admins can insert barber status"
ON public.barber_status
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default status
INSERT INTO public.barber_status (is_online) VALUES (true);

-- Enable realtime for barber_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.barber_status;