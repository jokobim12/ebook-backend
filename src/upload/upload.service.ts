import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  constructor(private supabase: SupabaseService) {}

  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<string> {
    // Compress and resize image
    const compressed = await this.compressImage(file.buffer, file.mimetype);
    
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error } = await this.supabase.getClient()
      .storage
      .from('uploads')
      .upload(fileName, compressed, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) throw error;

    const { data } = this.supabase.getClient()
      .storage
      .from('uploads')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  private async compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Resize if too large (max 1200px on longest side)
    const maxDimension = 1200;
    if (width > maxDimension || height > maxDimension) {
      sharpInstance = sharpInstance.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP with quality 80 (good balance of quality vs size)
    const compressed = await sharpInstance
      .webp({ quality: 80 })
      .toBuffer();

    return compressed;
  }
}
