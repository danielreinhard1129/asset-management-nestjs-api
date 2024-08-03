import { FileValidator, MaxFileSizeValidatorOptions } from '@nestjs/common';
import { IUploadField, Upload } from '../types';

export class MaxFileSizeValidator extends FileValidator<MaxFileSizeValidatorOptions> {
  private uploadFields: IUploadField[] = [];

  buildErrorMessage(): string {
    const errorFields = this.uploadFields
      .filter((field) => field.isError)
      .map((field) => field.fieldName)
      .join(', ');

    const maxSizeInMegabytes = this.validationOptions.maxSize / 1024 / 1024;

    this.uploadFields = [];

    return `${errorFields} validation failed (expected size is less than ${maxSizeInMegabytes} MB per file)`;
  }

  isValid(fields: Upload): boolean {
    this.validateFilesForFields(fields);

    return !this.uploadFields.some((field) => field.isError);
  }

  private validateFile(file: Express.Multer.File) {
    if (!this.validationOptions) {
      return true;
    }

    return 'size' in file && file.size < this.validationOptions.maxSize;
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
