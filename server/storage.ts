import { type FileMetadata, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getFile(id: string): Promise<FileMetadata | undefined>;
  getFileByObjectPath(objectPath: string): Promise<FileMetadata | undefined>;
  createFile(file: InsertFile): Promise<FileMetadata>;
  incrementDownloadCount(id: string): Promise<void>;
  getExpiredFiles(): Promise<FileMetadata[]>;
  deleteFile(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private files: Map<string, FileMetadata>;

  constructor() {
    this.files = new Map();
  }

  async getFile(id: string): Promise<FileMetadata | undefined> {
    return this.files.get(id);
  }

  async getFileByObjectPath(objectPath: string): Promise<FileMetadata | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.objectPath === objectPath
    );
  }

  async createFile(insertFile: InsertFile): Promise<FileMetadata> {
    const id = randomUUID();
    const file: FileMetadata = {
      ...insertFile,
      id,
      uploadTime: new Date(),
      downloadCount: 0,
    };
    this.files.set(id, file);
    return file;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const file = this.files.get(id);
    if (file) {
      file.downloadCount += 1;
      this.files.set(id, file);
    }
  }

  async getExpiredFiles(): Promise<FileMetadata[]> {
    const now = new Date();
    return Array.from(this.files.values()).filter(
      (file) => new Date(file.expirationTime) < now
    );
  }

  async deleteFile(id: string): Promise<void> {
    this.files.delete(id);
  }
}

export const storage = new MemStorage();
