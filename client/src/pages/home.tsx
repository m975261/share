import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Cloud, Clock, Copy, Check, File, Link as LinkIcon } from "lucide-react";
import { DELETION_TIME_OPTIONS } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deletionTime, setDeletionTime] = useState("10");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [expirationTime, setExpirationTime] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);

      const minutes = parseInt(deletionTime);
      const expiresInMs = minutes * 60 * 1000;

      const uploadUrlResponse = await apiRequest("POST", "/api/upload");
      const { uploadUrl } = await uploadUrlResponse.json();

      setUploadProgress(30);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setUploadProgress(60);

      const fileMetadataResponse = await apiRequest("POST", "/api/files", {
        filename: file.name,
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        objectPath: uploadUrl,
        expirationTime: new Date(Date.now() + expiresInMs).toISOString(),
      });

      const fileMetadata = await fileMetadataResponse.json();

      setUploadProgress(100);

      return fileMetadata;
    },
    onSuccess: (data) => {
      const fileUrl = `${window.location.origin}/download/${data.id}`;
      setUploadedFileUrl(fileUrl);
      setUploadedFileName(data.originalFilename);
      setUploadedFileSize(data.size);
      setExpirationTime(data.expirationTime);
      setIsUploading(false);
      toast({
        title: "Upload successful!",
        description: "Your file has been uploaded and is ready to share.",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleCopyLink = async () => {
    if (uploadedFileUrl) {
      await navigator.clipboard.writeText(uploadedFileUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The download link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setExpirationTime(null);
    setUploadProgress(0);
    setDeletionTime("10");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatExpirationTime = (expirationTime: string) => {
    const expiration = new Date(expirationTime);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours`;
    return `${Math.floor(diffMins / 1440)} days`;
  };

  if (uploadedFileUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b flex items-center px-6">
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">FileShare</h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-xl p-8">
            <div className="text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Successful!</h2>
                <p className="text-muted-foreground">Your file is ready to share</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm truncate" data-testid="text-uploaded-filename">{uploadedFileName}</p>
                    <p className="text-xs text-muted-foreground" data-testid="text-uploaded-filesize">
                      {uploadedFileSize && formatFileSize(uploadedFileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Expires in: </span>
                      <span className="font-medium" data-testid="text-expiration-time">
                        {expirationTime && formatExpirationTime(expirationTime)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Share this link</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/50 rounded px-3 py-2 font-mono text-sm truncate text-left" data-testid="text-share-link">
                    {uploadedFileUrl}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    size="icon"
                    variant="outline"
                    data-testid="button-copy-link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCopyLink}
                  className="flex-1"
                  data-testid="button-copy-link-primary"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleNewUpload}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-upload-another"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Another
                </Button>
              </div>
            </div>
          </Card>
        </main>

        <footer className="py-8 text-center text-sm text-muted-foreground">
          <p>Secure temporary file sharing • Files are automatically deleted</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">FileShare</h1>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">Share Files Temporarily</h2>
            <p className="text-lg text-muted-foreground">
              Upload, share, and let your files auto-delete when you want them to
            </p>
          </div>

          <Card className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              data-testid="dropzone-upload"
            >
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
              
              {!selectedFile && !isUploading && (
                <>
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Drag & drop files here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="outline"
                    data-testid="button-browse-files"
                  >
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Maximum file size: 100MB
                  </p>
                </>
              )}

              {selectedFile && !isUploading && (
                <div className="space-y-4">
                  <File className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <p className="font-medium" data-testid="text-selected-filename">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-selected-filesize">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="ghost"
                    size="sm"
                    data-testid="button-remove-file"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="space-y-4">
                  <Cloud className="w-12 h-12 mx-auto text-primary animate-pulse" />
                  <div>
                    <p className="font-medium mb-4">Uploading...</p>
                    <Progress value={uploadProgress} className="h-2" data-testid="progress-upload" />
                    <p className="text-sm text-muted-foreground mt-2" data-testid="text-upload-progress">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedFile && !isUploading && (
              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Delete file after
                  </Label>
                  <RadioGroup
                    value={deletionTime}
                    onValueChange={setDeletionTime}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {DELETION_TIME_OPTIONS.map((option, index) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`time-${option.value}`}
                          className="peer sr-only"
                          data-testid={`radio-deletion-time-${index}`}
                        />
                        <Label
                          htmlFor={`time-${option.value}`}
                          className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-3 hover-elevate active-elevate-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          data-testid={`label-deletion-time-${index}`}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleUpload}
                  className="w-full"
                  size="lg"
                  data-testid="button-upload"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Secure temporary file sharing • Files are automatically deleted</p>
      </footer>
    </div>
  );
}
