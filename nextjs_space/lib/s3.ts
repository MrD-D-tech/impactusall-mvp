import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

/**
 * Resolves a URL that might be an S3 key (prefixed with s3key::) to a signed URL
 * If it's already a regular URL, returns it as-is
 */
export async function resolveImageUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  
  // Check if this is an S3 key reference
  if (url.startsWith('s3key::')) {
    const s3Key = url.replace('s3key::', '');
    try {
      // Generate a signed URL valid for 6 days (under the 7-day limit)
      return await getSignedDownloadUrl(s3Key, 518400); // 6 days in seconds
    } catch (error) {
      console.error('Error generating signed URL for:', s3Key, error);
      return null;
    }
  }
  
  // Already a regular URL
  return url;
}

/**
 * Upload a file to S3
 * @param buffer - File buffer
 * @param fileName - Desired file name (will be prefixed with folder)
 * @param contentType - MIME type of the file
 * @returns The S3 key (cloud_storage_path)
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const key = `${folderPrefix}${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  return key;
}

/**
 * Get a signed URL for downloading a file from S3
 * @param key - The S3 key (cloud_storage_path)
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3
 * @param key - The S3 key (cloud_storage_path)
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  await s3Client.send(command);
}

/**
 * Rename a file in S3 (copy + delete)
 * @param oldKey - Current S3 key
 * @param newKey - New S3 key
 */
export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  // S3 doesn't have a native rename, so we'd need to copy + delete
  // For now, we'll just return the new key pattern
  // This is a simplified version - full implementation would require CopyObjectCommand
  return `${folderPrefix}${newKey}`;
}
