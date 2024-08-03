import { FileTypeValidatorOptions, FileValidator } from '@nestjs/common';
import { IUploadField, Upload } from '../types';

export class FileTypeValidator extends FileValidator<FileTypeValidatorOptions> {
  private uploadFields: IUploadField[] = [];

  buildErrorMessage(): string {
    const errorFields = this.uploadFields
      .filter((field) => field.isError)
      .map((field) => field.fieldName)
      .join(', ');

    this.uploadFields = [];

    return `${errorFields} validation failed (expected type is ${this.validationOptions.fileType})`;
  }

  isValid(fields: Upload): boolean | Promise<boolean> {
    this.validateFilesForFields(fields);

    return !this.uploadFields.some((field) => field.isError);
  }

  private validateFile(file: Express.Multer.File) {
    if (!this.validationOptions) {
      return true;
    }

    return (
      !!file &&
      'mimetype' in file &&
      !!file.mimetype.match(this.validationOptions.fileType)
    );
  }

  private processUploadField(files: Express.Multer.File[]) {
    for (const file of files) {
      this.uploadFields.push({
        fieldName: file.fieldname,
        isError: !this.validateFile(file),
      });
    }
  }

  private validateFilesForFields(fields: Upload) {
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const files = fields[key];

        this.processUploadField(files);
      }
    }
  }
}
