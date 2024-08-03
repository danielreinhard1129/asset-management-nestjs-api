import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './types';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(secureUrl: string): Promise<any> {
    try {
      const publicId = this.extractPublicIdFromUrl(secureUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  private extractPublicIdFromUrl(url: string): string {
    const urlParts = url.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
  }
}
