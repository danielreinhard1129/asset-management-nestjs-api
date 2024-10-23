import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetRequestModule } from './asset-request/asset-request.module';
import { AssetModule } from './asset/asset.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DepartmentModule } from './department/department.module';
import { PaginationModule } from './pagination/pagination.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { InfoModule } from './info/info.module';
import { AssetHistoryModule } from './asset-history/asset-history.module';
import { BastModule } from './bast/bast.module';
import { AssetReturnModule } from './asset-return/asset-return.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AssetModule,
    PaginationModule,
    CloudinaryModule,
    DepartmentModule,
    AssetRequestModule,
    CategoryModule,
    InfoModule,
    AssetHistoryModule,
    BastModule,
    AssetReturnModule,
    MailModule,
  ],
})
export class AppModule {}
