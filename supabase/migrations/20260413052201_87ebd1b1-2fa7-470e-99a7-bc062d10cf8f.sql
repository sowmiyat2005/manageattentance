
CREATE TABLE public.marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  marks_obtained NUMERIC NOT NULL DEFAULT 0,
  max_marks NUMERIC NOT NULL DEFAULT 100,
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marks viewable by authenticated users"
ON public.marks FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins and faculty can manage marks"
ON public.marks FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'faculty'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'faculty'::app_role));

CREATE TRIGGER update_marks_updated_at
BEFORE UPDATE ON public.marks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
