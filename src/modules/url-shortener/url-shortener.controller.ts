import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateUrlDto } from './dtos/create-url.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('url-shortener')
export class UrlShortenerController {
  private readonly logger = new Logger(UrlShortenerController.name);

  constructor(private shortCodeService: UrlShortenerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    this.logger.log('Received request to create short URL.');
    this.logger.debug('Creating a short URL for: ' + createUrlDto.url);

    try {
      const shortCodeData = await this.shortCodeService.shortenUrl(
        createUrlDto.url,
      );

      this.logger.debug(
        `Short URL created with code: ${shortCodeData.shortCode}`,
      );
      return { shortCode: shortCodeData.shortCode, url: createUrlDto.url };
    } catch (error) {
      this.logger.error('Failed to create short URL', error.stack);
      throw new NotFoundException('Failed to create short URL');
    }
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get original URL by short code' })
  @ApiResponse({ status: 200, description: 'The original URL.', type: String })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async getOriginalUrl(@Param('code') code: string) {
    this.logger.log(`Received request to fetch URL with short code: ${code}`);

    try {
      const url = await this.shortCodeService.getUrlByShortCode(code);
      if (!url) {
        this.logger.warn(`No URL found for the provided code: ${code}`);
        throw new NotFoundException(
          `No URL found for the provided code: ${code}`,
        );
      }

      this.logger.log(`URL retrieved: ${url.originalUrl}`);
      await this.shortCodeService.incrementAccessCount(code);
      this.logger.log(`Access count incremented for code: ${code}`);
      return { originalUrl: url.originalUrl };
    } catch (error) {
      this.logger.error(`Error retrieving URL with code: ${code}`, error.stack);
      throw new NotFoundException(`Error retrieving URL with code: ${code}`);
    }
  }
}
