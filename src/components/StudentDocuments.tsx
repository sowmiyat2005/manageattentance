import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDocumentsProps {
  student: { id: string; full_name: string; student_id: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDocuments({ student, open, onOpenChange }: StudentDocumentsProps) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const folderPath = student ? `${student.id}/` : "";

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["student-documents", student?.id],
    enabled: !!student && open,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("student-documents")
        .list(student!.id, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const { error } = await supabase.storage
        .from("student-documents")
        .remove([filePath]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["student-documents", student?.id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !student) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage
          .from("student-documents")
          .upload(`${student.id}/${safeName}`, file);
        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        } else {
          toast.success(`${file.name} uploaded`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["student-documents", student?.id] });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (fileName: string) => {
    if (!student) return;
    const { data, error } = await supabase.storage
      .from("student-documents")
      .download(`${student.id}/${fileName}`);
    if (error) { toast.error(error.message); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Documents — {student?.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Upload area */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <Label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {uploading ? "Uploading…" : "Click to upload ID proofs or certificates"}
              </span>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG — max 10MB</span>
            </Label>
            <Input
              id="doc-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </div>

          {/* Document list */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && documents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded yet</p>
            )}
            <AnimatePresence>
              {documents.map((doc) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 group"
                >
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name.replace(/^\d+_/, "")}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.metadata?.size ? formatSize(doc.metadata.size) : "—"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDownload(doc.name)}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => deleteMutation.mutate(`${student!.id}/${doc.name}`)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
