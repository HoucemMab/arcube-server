import { Module } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { UrlShortenerController } from './url-shortener.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlShortener } from './entity/url-shortener.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrlShortener])],
  providers: [UrlShortenerService],
  controllers: [UrlShortenerController],
  exports: [UrlShortenerService],
})
export class UrlShortenerModule {}
