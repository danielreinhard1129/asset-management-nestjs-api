import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { FileCount, Upload } from '../types';

@Injectable()
export class RequiredFilePipe implements PipeTransform {
  private fileCount: FileCount;
  private missingFiles: Record<keyof FileCount, number> = {};

  constructor(fileCount: FileCount) {
    this.fileCount = fileCount;
  }

  private buildErrorMessage(): string {
    const missingFileEntries = Object.entries(this.missingFiles);

    const errorMessage = missingFileEntries.reduce(
      (accumulator, currentValue, index) => {
        const [key, value] = currentValue;

        if (index === missingFileEntries.length - 1) {
          return (accumulator += `${key} (${value})`);
        }

        return (accumulator += `${key} (${value}), `);
      },
      'File required: ',
    );

    this.missingFiles = {};

    return errorMessage;
  }

  transform(files: Upload): Upload {
    for (const key in this.fileCount) {
      const uploadedFiles = files[key];
      const expectedFileCount = this.fileCount[key];
      const uploadedFileCount = uploadedFiles?.length || 0;

      if (uploadedFiles && uploadedFileCount === expectedFileCount) {
        continue;
      }

      this.missingFiles[key] = expectedFileCount;
    }

    if (Object.keys(this.missingFiles).length) {
      throw new BadRequestException(this.buildErrorMessage());
    }

    return files;
  }
}
