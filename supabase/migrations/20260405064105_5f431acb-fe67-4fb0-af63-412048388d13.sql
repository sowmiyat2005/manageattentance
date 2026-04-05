
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-documents');

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'student-documents' AND public.has_role(auth.uid(), 'admin'));
