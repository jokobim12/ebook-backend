import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FeaturedService } from './featured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('featured')
export class FeaturedController {
  constructor(private featuredService: FeaturedService) {}

  @Get()
  getAll() {
    return this.featuredService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  set(@Body() body: { items: { ebook_id: string; position: number }[] }) {
    return this.featuredService.set(body.items);
  }
}
