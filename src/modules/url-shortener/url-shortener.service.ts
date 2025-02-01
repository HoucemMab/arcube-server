import { Injectable } from '@nestjs/common';
import { UrlShortener } from './entity/url-shortener.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateShortCode } from '../../common/utils/url';
@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(UrlShortener)
    private urlShortenerRepository: Repository<UrlShortener>,
  ) {}
  async shortenUrl(originalUrl: string): Promise<UrlShortener> {
    const existingUrl = await this.getUrlByOriginalUrl(originalUrl);
    if (existingUrl) {
      return existingUrl;
    }
    const shortCode = generateShortCode();
    const urlShortener = this.urlShortenerRepository.create({
      originalUrl,
      shortCode,
    });
    await this.urlShortenerRepository.save(urlShortener);
    return urlShortener;
  }

  async getUrlByShortCode(shortCode: string): Promise<UrlShortener> {
    return this.urlShortenerRepository.findOne({
      where: { shortCode },
    });
  }
  async getUrlByOriginalUrl(originalUrl: string): Promise<UrlShortener> {
    return this.urlShortenerRepository.findOne({
      where: { originalUrl },
    });
  }
  async incrementAccessCount(shortCode: string): Promise<void> {
    const urlShortener = await this.getUrlByShortCode(shortCode);
    if (urlShortener) {
      urlShortener.visits += 1;
      await this.urlShortenerRepository.save(urlShortener);
    }
  }
}
