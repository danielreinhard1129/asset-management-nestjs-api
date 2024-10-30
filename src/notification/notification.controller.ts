import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { PayloadToken } from 'src/auth/types';
import { GetNotificationsDTO } from './dto/get-notifications.dto';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'HR', 'USER')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  async getNotifications(
    @Query() query: GetNotificationsDTO,
    @User() user: PayloadToken,
  ) {
    return this.notificationService.getNotifications(query, Number(user.id));
  }

  @Get('/unread')
  async getUnreadNotifications(@User() user: PayloadToken) {
    return this.notificationService.getUnreadNotification(Number(user.id));
  }

  @Get('/:id')
  async getNotification(@Param('id') id: number, @User() user: PayloadToken) {
    return this.notificationService.getNotification(id, Number(user.id));
  }

  @Patch('/:id/read')
  async readNotification(@User() user: PayloadToken, @Param('id') id: number) {
    return await this.notificationService.readNotification(id, Number(user.id));
  }
}
