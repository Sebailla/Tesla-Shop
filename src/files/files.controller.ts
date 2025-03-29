import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/file-filter';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {

    const path = this.filesService.getStaticProductImage(imageName)

    res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {

    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 10MB
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer,
    }),

  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File) {

    if (!file) {
      throw new BadRequestException('Invalid file extension! Only jpg, jpeg, png, gif are allowed.')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {
      secureUrl
    }
  }
}
