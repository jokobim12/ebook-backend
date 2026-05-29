import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ebooks')
export class EbooksController {
  constructor(private ebooksService: EbooksService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.ebooksService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ebooksService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/books')
  findMyBooks(@Request() req) {
    return this.ebooksService.findByAuthor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Request() req) {
    return this.ebooksService.create({ ...body, author_id: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.ebooksService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ebooksService.delete(id);
  }

  @Post(':id/view')
  incrementView(@Param('id') id: string) {
    return this.ebooksService.incrementViews(id);
  }

  // Pages
  @Get(':id/pages')
  getPages(@Param('id') id: string) {
    return this.ebooksService.getPages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pages')
  savePage(@Param('id') id: string, @Body() body: any) {
    return this.ebooksService.savePage(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/pages/:pageId')
  deletePage(@Param('pageId') pageId: string) {
    return this.ebooksService.deletePage(pageId);
  }
}
