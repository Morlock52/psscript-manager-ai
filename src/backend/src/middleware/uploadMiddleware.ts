import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Dummy multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Dummy disk upload (same as memory for now)
const diskUpload = multer({ storage });

/**
 * Dummy Multer error handler middleware.
 */
function handleMulterError(err: any, req: Request, res: Response, next: NextFunction): void {
  next();
}

/**
 * Dummy upload progress middleware.
 */
function handleUploadProgress(req: Request, res: Response, next: NextFunction): void {
  next();
}

export default upload;
export { handleMulterError, diskUpload, handleUploadProgress };
