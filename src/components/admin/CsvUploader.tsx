
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CsvUploaderProps {
  onUpload: (file: File, fileType: 'coverage_fact' | 'blocker') => void;
  isLoading: boolean;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'coverage_fact' | 'blocker'>('coverage_fact');
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile) {
      onUpload(selectedFile, fileType);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="mb-2 block">File Type</Label>
        <RadioGroup value={fileType} onValueChange={(value) => setFileType(value as 'coverage_fact' | 'blocker')} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coverage_fact" id="coverage_fact" />
            <Label htmlFor="coverage_fact">Coverage Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="blocker" id="blocker" />
            <Label htmlFor="blocker">Blocker Data</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />
        <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">
            Drag & drop your CSV file here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Accepts CSV files only
          </p>
        </Label>
      </div>
      
      {selectedFile && (
        <div className="bg-muted p-4 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default CsvUploader;
