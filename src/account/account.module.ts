import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [PaginationModule, CloudinaryModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
