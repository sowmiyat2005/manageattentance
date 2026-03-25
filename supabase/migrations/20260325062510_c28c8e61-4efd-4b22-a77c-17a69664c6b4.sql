CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  max_marks integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments viewable by authenticated users" ON public.assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and faculty can manage assignments" ON public.assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'faculty'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'faculty'));