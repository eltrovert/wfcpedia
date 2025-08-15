import type { CafeImage } from '../types/cafe'

/**
 * Image processing error classes
 */
export class ImageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ImageError'
  }
}

export class CompressionError extends ImageError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'COMPRESSION_ERROR', originalError)
  }
}

export class UploadError extends ImageError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'UPLOAD_ERROR', originalError)
  }
}

export class ValidationError extends ImageError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
  }
}

/**
 * Image processing options
 */
interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  maxSizeKB?: number
}

interface ImageUploadOptions {
  compression?: ImageCompressionOptions
  generateThumbnail?: boolean
  sessionId: string
}

interface ProcessedImage {
  originalFile: File
  compressedBlob: Blob
  thumbnailBlob?: Blob
  metadata: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    dimensions: { width: number; height: number }
    format: string
  }
}

/**
 * Service for handling photo upload, compression, and WebP conversion
 * Optimized for mobile networks and storage efficiency
 */
export class ImageService {
  // Default compression settings optimized for mobile
  private readonly DEFAULT_COMPRESSION: Required<ImageCompressionOptions> = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'webp',
    maxSizeKB: 500, // 500KB max for main images
  }

  private readonly THUMBNAIL_COMPRESSION: Required<ImageCompressionOptions> = {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    format: 'webp',
    maxSizeKB: 50, // 50KB max for thumbnails
  }

  // Allowed file types
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]

  // Maximum file size before compression (10MB)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024

  /**
   * Validate image file before processing
   */
  validateImage(file: File): void {
    if (!file) {
      throw new ValidationError('No file provided')
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError(
        `Unsupported file type: ${file.type}. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      )
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      )
    }
  }

  /**
   * Process image: compress, convert to WebP, and generate thumbnail
   */
  async processImage(
    file: File,
    options: ImageCompressionOptions = {}
  ): Promise<ProcessedImage> {
    this.validateImage(file)

    const compressionOptions = { ...this.DEFAULT_COMPRESSION, ...options }

    try {
      // Load image and get dimensions
      const { canvas, dimensions } = await this.loadImageToCanvas(file)

      // Compress main image
      const compressedBlob = await this.compressCanvas(
        canvas,
        dimensions,
        compressionOptions
      )

      // Generate thumbnail if requested
      let thumbnailBlob: Blob | undefined
      if (options.generateThumbnail !== false) {
        thumbnailBlob = await this.generateThumbnail(canvas, dimensions)
      }

      const metadata = {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressionRatio: file.size / compressedBlob.size,
        dimensions,
        format: compressionOptions.format,
      }

      return {
        originalFile: file,
        compressedBlob,
        thumbnailBlob,
        metadata,
      }
    } catch (error) {
      console.error('Image processing failed:', error)
      throw new CompressionError('Failed to process image', error)
    }
  }

  /**
   * Upload processed images to storage
   * Note: In a real implementation, this would upload to cloud storage (e.g., Cloudinary, AWS S3)
   * For now, we'll create data URLs for local storage/caching
   */
  async uploadImages(
    processedImage: ProcessedImage,
    options: ImageUploadOptions
  ): Promise<CafeImage> {
    try {
      // Generate unique filename
      // const timestamp = Date.now()
      const sessionId = options.sessionId
      // const fileExtension = processedImage.metadata.format

      // In a real implementation, these would be actual upload URLs
      // For now, we'll use data URLs that can be cached locally
      const mainImageUrl = await this.blobToDataUrl(
        processedImage.compressedBlob
      )
      const thumbnailUrl = processedImage.thumbnailBlob
        ? await this.blobToDataUrl(processedImage.thumbnailBlob)
        : mainImageUrl

      const cafeImage: CafeImage = {
        url: mainImageUrl,
        thumbnailUrl,
        uploadedBy: sessionId,
        uploadedAt: new Date().toISOString(),
      }

      // Log upload statistics for monitoring
      console.warn('Image upload completed:', {
        originalSize: `${(processedImage.metadata.originalSize / 1024).toFixed(2)}KB`,
        compressedSize: `${(processedImage.metadata.compressedSize / 1024).toFixed(2)}KB`,
        compressionRatio: `${processedImage.metadata.compressionRatio.toFixed(2)}x`,
        dimensions: processedImage.metadata.dimensions,
        format: processedImage.metadata.format,
      })

      return cafeImage
    } catch (error) {
      console.error('Image upload failed:', error)
      throw new UploadError('Failed to upload image', error)
    }
  }

  /**
   * Process and upload image in one operation
   */
  async processAndUpload(
    file: File,
    options: ImageUploadOptions
  ): Promise<CafeImage> {
    const processed = await this.processImage(file, options.compression)
    return this.uploadImages(processed, options)
  }

  /**
   * Batch process multiple images
   */
  async processBatchImages(
    files: File[],
    options: ImageUploadOptions
  ): Promise<CafeImage[]> {
    if (files.length === 0) {
      return []
    }

    // Process images in parallel but limit concurrency to avoid memory issues
    const BATCH_SIZE = 3
    const results: CafeImage[] = []

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      const batchPromises = batch.map(file =>
        this.processAndUpload(file, options)
      )

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error)
        throw error
      }
    }

    return results
  }

  /**
   * Load image file to canvas and get dimensions with memory optimization
   */
  private async loadImageToCanvas(file: File): Promise<{
    canvas: HTMLCanvasElement
    dimensions: { width: number; height: number }
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let objectURL: string | null = null

      if (!ctx) {
        reject(new CompressionError('Failed to get canvas 2D context'))
        return
      }

      const cleanup = (): void => {
        if (objectURL) {
          URL.revokeObjectURL(objectURL)
          objectURL = null
        }
      }

      img.onload = () => {
        try {
          const dimensions = { width: img.width, height: img.height }
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          cleanup()
          resolve({ canvas, dimensions })
        } catch {
          cleanup()
          reject(new CompressionError('Failed to draw image to canvas'))
        }
      }

      img.onerror = () => {
        cleanup()
        reject(new CompressionError('Failed to load image'))
      }

      objectURL = URL.createObjectURL(file)
      img.src = objectURL
    })
  }

  /**
   * Compress canvas to blob with specified options
   */
  private async compressCanvas(
    canvas: HTMLCanvasElement,
    originalDimensions: { width: number; height: number },
    options: Required<ImageCompressionOptions>
  ): Promise<Blob> {
    // Calculate new dimensions
    const { width, height } = this.calculateDimensions(
      originalDimensions,
      options.maxWidth,
      options.maxHeight
    )

    // Create new canvas with target dimensions
    const targetCanvas = document.createElement('canvas')
    const targetCtx = targetCanvas.getContext('2d')

    if (!targetCtx) {
      throw new CompressionError('Failed to get target canvas 2D context')
    }

    targetCanvas.width = width
    targetCanvas.height = height

    // Draw resized image
    targetCtx.drawImage(canvas, 0, 0, width, height)

    // Convert to blob with compression
    return new Promise((resolve, reject) => {
      targetCanvas.toBlob(
        blob => {
          if (!blob) {
            reject(new CompressionError('Failed to create compressed blob'))
            return
          }

          // Check if size meets requirements
          if (blob.size > options.maxSizeKB * 1024) {
            // If still too large, reduce quality and try again
            const reducedQuality = Math.max(0.1, options.quality * 0.8)
            targetCanvas.toBlob(
              reducedBlob => {
                if (!reducedBlob) {
                  reject(
                    new CompressionError(
                      'Failed to create reduced quality blob'
                    )
                  )
                  return
                }
                resolve(reducedBlob)
              },
              `image/${options.format}`,
              reducedQuality
            )
          } else {
            resolve(blob)
          }
        },
        `image/${options.format}`,
        options.quality
      )
    })
  }

  /**
   * Generate thumbnail from canvas
   */
  private async generateThumbnail(
    canvas: HTMLCanvasElement,
    originalDimensions: { width: number; height: number }
  ): Promise<Blob> {
    return this.compressCanvas(
      canvas,
      originalDimensions,
      this.THUMBNAIL_COMPRESSION
    )
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    original: { width: number; height: number },
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    if (original.width <= maxWidth && original.height <= maxHeight) {
      return original
    }

    const aspectRatio = original.width / original.height

    if (original.width > original.height) {
      // Landscape
      const width = Math.min(maxWidth, original.width)
      const height = width / aspectRatio
      return { width, height: Math.min(height, maxHeight) }
    } else {
      // Portrait or square
      const height = Math.min(maxHeight, original.height)
      const width = height * aspectRatio
      return { width: Math.min(width, maxWidth), height }
    }
  }

  /**
   * Convert blob to data URL for storage
   */
  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () =>
        reject(new CompressionError('Failed to convert blob to data URL'))
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Check if WebP is supported in the current browser
   */
  isWebPSupported(): boolean {
    // Check if running in browser environment
    if (typeof document === 'undefined') {
      return false
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1

      // Try to convert to WebP
      const dataUrl = canvas.toDataURL('image/webp')
      return dataUrl.startsWith('data:image/webp')
    } catch (error) {
      console.warn('WebP support detection failed:', error)
      return false
    }
  }

  /**
   * Get optimal image format for the current browser
   */
  getOptimalFormat(): 'webp' | 'jpeg' {
    return this.isWebPSupported() ? 'webp' : 'jpeg'
  }

  /**
   * Estimate processing time based on file size
   */
  estimateProcessingTime(file: File): number {
    // Rough estimate: 1MB = 1 second on mobile
    const sizeInMB = file.size / (1024 * 1024)
    return Math.max(1, Math.ceil(sizeInMB))
  }

  /**
   * Create image compression preview for user
   */
  async createCompressionPreview(
    file: File,
    options: ImageCompressionOptions = {}
  ): Promise<{
    preview: string
    estimatedSize: number
    estimatedTime: number
  }> {
    const tempOptions = { ...this.DEFAULT_COMPRESSION, ...options }

    // Create a smaller preview for estimation
    const previewOptions = {
      ...tempOptions,
      maxWidth: 400,
      maxHeight: 400,
    }

    const processed = await this.processImage(file, previewOptions)
    const preview = await this.blobToDataUrl(processed.compressedBlob)

    // Estimate full-size compressed size based on preview
    const scaleFactor =
      (tempOptions.maxWidth * tempOptions.maxHeight) / (400 * 400)
    const estimatedSize = processed.compressedBlob.size * scaleFactor

    return {
      preview,
      estimatedSize,
      estimatedTime: this.estimateProcessingTime(file),
    }
  }
}

// Singleton instance for the application
export const imageService = new ImageService()
