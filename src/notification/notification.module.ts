import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/pagination/pagination.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [PaginationModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
