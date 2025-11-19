import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Download, File, Clock, HardDrive, Calendar, AlertCircle } from "lucide-react";
import type { FileMetadata } from "@shared/schema";

export default function DownloadPage() {
  const [, params] = useRoute("/download/:id");
  const [, setLocation] = useLocation();
  const fileId = params?.id;

  const { data: file, isLoading, error } = useQuery<FileMetadata>({
    queryKey: ["/api/files", fileId],
    enabled: !!fileId,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const response = await fetch(file.objectPath);
      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExpirationTime = (expirationTime: string) => {
    const expiration = new Date(expirationTime);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    
    if (diffMs < 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours`;
    return `${Math.floor(diffMins / 1440)} days`;
  };

  const isExpired = (expirationTime: string) => {
    return new Date(expirationTime) < new Date();
  };

  if (isLoading) {
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
            <div className="space-y-6">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !file) {
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
              <div className="w-24 h-24 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">File Not Found</h2>
                <p className="text-muted-foreground">
                  This file may have expired or been deleted.
                </p>
              </div>
              <Button onClick={() => setLocation("/")} data-testid="button-go-home">
                Go to Home
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const expired = isExpired(file.expirationTime);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">FileShare</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-upload-new">
            Upload New File
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-xl p-8">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <File className="w-12 h-12 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2 truncate" data-testid="text-file-name">
                {file.originalFilename}
              </h2>
              {expired && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  This file has expired
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <HardDrive className="w-4 h-4" />
                  <span>File Size</span>
                </div>
                <p className="font-medium" data-testid="text-file-size">{formatFileSize(file.size)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Uploaded</span>
                </div>
                <p className="font-medium text-sm" data-testid="text-upload-date">{formatDate(file.uploadTime)}</p>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Expires In</span>
                </div>
                <p className={`font-medium ${expired ? "text-destructive" : ""}`} data-testid="text-expires-in">
                  {formatExpirationTime(file.expirationTime)}
                </p>
              </div>
            </div>

            <Button
              onClick={() => downloadMutation.mutate()}
              disabled={expired || downloadMutation.isPending}
              className="w-full h-12"
              size="lg"
              data-testid="button-download"
            >
              <Download className="w-5 h-5 mr-2" />
              {downloadMutation.isPending ? "Downloading..." : expired ? "File Expired" : "Download File"}
            </Button>

            {!expired && (
              <p className="text-xs text-muted-foreground">
                This file will be automatically deleted after expiration
              </p>
            )}
          </div>
        </Card>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Secure temporary file sharing • Files are automatically deleted</p>
      </footer>
    </div>
  );
}
