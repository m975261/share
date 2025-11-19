import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertFileSchema } from "@shared/schema";
import cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();

  // Endpoint to get presigned upload URL
  app.post("/api/upload", async (req, res) => {
    try {
      const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadUrl });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Endpoint to save file metadata after upload
  app.post("/api/files", async (req, res) => {
    try {
      const validatedData = insertFileSchema.parse(req.body);
      
      console.log("📝 Received object path:", validatedData.objectPath);
      
      // Normalize the object path from the upload URL
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(
        validatedData.objectPath
      );

      console.log("✅ Normalized path:", normalizedPath);

      const file = await storage.createFile({
        ...validatedData,
        objectPath: normalizedPath,
        expirationTime: validatedData.expirationTime,
      });

      console.log("💾 Stored file with objectPath:", file.objectPath);

      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file metadata:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create file metadata" 
      });
    }
  });

  // Endpoint to get file metadata
  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if file has expired
      if (new Date(file.expirationTime) < new Date()) {
        return res.status(410).json({ error: "File has expired" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error getting file:", error);
      res.status(500).json({ error: "Failed to get file" });
    }
  });

  // Health check endpoint for Docker
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint to download file
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      // Construct the full object path (req.path includes /objects/ prefix)
      const fullObjectPath = req.path;
      
      console.log("📥 Download requested for path:", fullObjectPath);
      
      // Get file metadata from storage
      const fileMetadata = await storage.getFileByObjectPath(fullObjectPath);
      
      if (!fileMetadata) {
        console.log("❌ File metadata not found for path:", fullObjectPath);
        return res.status(404).json({ error: "File not found" });
      }

      console.log("✅ Found file metadata:", fileMetadata.id, fileMetadata.originalFilename);

      // Check if file has expired
      if (new Date(fileMetadata.expirationTime) < new Date()) {
        console.log("⏰ File has expired");
        return res.status(410).json({ error: "File has expired" });
      }

      // Get object file from storage
      const objectFile = await objectStorageService.getObjectEntityFile(fullObjectPath);
      
      console.log("✅ Got object file from storage");
      
      // Increment download count
      await storage.incrementDownloadCount(fileMetadata.id);
      
      console.log("📊 Download count incremented");
      
      // Stream the file
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      return res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Cleanup expired files every minute
  cron.schedule("* * * * *", async () => {
    try {
      const expiredFiles = await storage.getExpiredFiles();
      
      for (const file of expiredFiles) {
        try {
          // Delete from object storage
          await objectStorageService.deleteObject(file.objectPath);
          
          // Delete from storage
          await storage.deleteFile(file.id);
          
          console.log(`Deleted expired file: ${file.originalFilename} (${file.id})`);
        } catch (error) {
          console.error(`Error deleting file ${file.id}:`, error);
        }
      }

      if (expiredFiles.length > 0) {
        console.log(`Cleanup completed: ${expiredFiles.length} files deleted`);
      }
    } catch (error) {
      console.error("Error in cleanup job:", error);
    }
  });

  console.log("🗑️  Automatic file cleanup scheduler started (runs every minute)");

  const httpServer = createServer(app);
  return httpServer;
}
