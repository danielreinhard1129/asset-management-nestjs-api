import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

export type Upload = Record<string, Express.Multer.File[]>;

export type FileCount = Record<string, number>;
export interface IUploadField {
  fieldName: string;
  isError: boolean;
}
