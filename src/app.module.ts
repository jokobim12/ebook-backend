import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EbooksModule } from './ebooks/ebooks.module';
import { CategoriesModule } from './categories/categories.module';
import { BannersModule } from './banners/banners.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { UploadModule } from './upload/upload.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FeaturedModule } from './featured/featured.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    EbooksModule,
    CategoriesModule,
    BannersModule,
    AnnouncementsModule,
    UploadModule,
    FeaturedModule,
  ],
})
export class AppModule {}
