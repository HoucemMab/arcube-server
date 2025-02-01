import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlShortener } from '../src/modules/url-shortener/entity/url-shortener.entity';

describe('UrlShortenerController (e2e)', () => {
  let app: INestApplication;
  let urlShortenerRepository: Repository<UrlShortener>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    urlShortenerRepository = moduleFixture.get<Repository<UrlShortener>>(
      getRepositoryToken(UrlShortener),
    );
  });

  afterEach(async () => {
    await urlShortenerRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  const baseUrl = '/url-shortener';

  describe('POST /url-shortener', () => {
    it('should create a short URL', async () => {
      const originalUrl = 'https://example.com';
      const response = await request(app.getHttpServer())
        .post(baseUrl)
        .send({ url: originalUrl })
        .expect(201);

      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('url', originalUrl);
    });

    it('should return the same short URL if already shortened', async () => {
      const originalUrl = 'https://example.com';
      const firstResponse = await request(app.getHttpServer())
        .post(baseUrl)
        .send({ url: originalUrl });

      const secondResponse = await request(app.getHttpServer())
        .post(baseUrl)
        .send({ url: originalUrl });

      expect(secondResponse.body.shortCode).toEqual(
        firstResponse.body.shortCode,
      );
    });
  });

  describe('GET /url-shortener/:code', () => {
    it('should return 404 for a non-existent short code', async () => {
      const response = await request(app.getHttpServer())
        .get(`${baseUrl}/invalid123`)
        .expect(404);

      expect(response.body.message).toContain(
        'Error retrieving URL with code: invalid123',
      );
    });
  });
});
