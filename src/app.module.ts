import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetModule } from './asset/asset.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaginationModule } from './pagination/pagination.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    AssetModule,
    PaginationModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
