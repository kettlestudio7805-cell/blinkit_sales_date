import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateCSVStructure } from "@/lib/csvParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: data.message,
      });
      setUploadedFileName(null);
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/filter-options'] });
      onUploadSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      await validateCSVStructure(file);
      uploadMutation.mutate(file);
    } catch (error) {
      setIsUploading(false);
      setUploadedFileName(null);
      toast({
        title: "Invalid CSV File",
        description: error instanceof Error ? error.message : "Please check your CSV format",
        variant: "destructive",
      });
    }
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive && !isDragReject 
            ? 'border-primary bg-primary/5' 
            : isDragReject 
            ? 'border-destructive bg-destructive/5' 
            : 'border-border hover:border-primary hover:bg-primary/5'
          }
        `}
        data-testid="dropzone-upload"
      >
        <input {...getInputProps()} data-testid="input-csv-file" />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : uploadedFileName ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : isDragReject ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <CloudUpload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          {isUploading ? (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Uploading CSV File...
              </h3>
              <p className="text-muted-foreground">
                Processing {uploadedFileName}
              </p>
            </div>
          ) : uploadedFileName ? (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                File Ready to Upload
              </h3>
              <p className="text-muted-foreground mb-4">
                <FileText className="w-4 h-4 inline mr-1" />
                {uploadedFileName}
              </p>
            </div>
          ) : isDragActive ? (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isDragReject ? 'Invalid file type' : 'Drop your CSV file here'}
              </h3>
              <p className="text-muted-foreground">
                {isDragReject ? 'Only CSV files are supported' : 'Release to upload'}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upload CSV File
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <Button 
                variant="default" 
                disabled={isUploading}
                data-testid="button-choose-file"
              >
                Choose File
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Required CSV columns:</strong> item_id, item_name, manufacturer_id, manufacturer_name, 
          city_id, city_name, category, date, qty_sold, mrp
        </p>
        <p className="mt-1">
          Maximum file size: 10MB
        </p>
      </div>
    </div>
  );
}
