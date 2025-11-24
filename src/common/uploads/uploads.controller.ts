import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upload(@Request() req, @Body() uploadDto: UploadImageDto) {
    // Aumentar el límite del body si envías base64 muy grandes en main.ts
    return this.uploadsService.uploadImage(req.user.userId, uploadDto);
  }
}