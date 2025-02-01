import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerService } from './url-shortener.service';
import { Repository } from 'typeorm';
import { UrlShortener } from './entity/url-shortener.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { generateShortCode } from '../../common/utils/url';
describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let urlShortenerRepository: Repository<UrlShortener>;

  const mockUrlShortenerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlShortenerService,
        {
          provide: getRepositoryToken(UrlShortener),
          useValue: mockUrlShortenerRepository,
        },
      ],
    }).compile();

    service = module.get<UrlShortenerService>(UrlShortenerService);
    urlShortenerRepository = module.get<Repository<UrlShortener>>(
      getRepositoryToken(UrlShortener),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    it('should return existing URL if already shortened', async () => {
      const existingUrl = new UrlShortener();
      existingUrl.originalUrl = 'https://example.com';
      existingUrl.shortCode = 'abcd12';

      mockUrlShortenerRepository.findOne.mockResolvedValue(existingUrl);

      const result = await service.shortenUrl(existingUrl.originalUrl);
      expect(result).toEqual(existingUrl);
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { originalUrl: existingUrl.originalUrl },
      });
      expect(mockUrlShortenerRepository.create).not.toHaveBeenCalled();
      expect(mockUrlShortenerRepository.save).not.toHaveBeenCalled();
    });

    it('should create a new short URL if not found', async () => {
      const originalUrl = 'https://example.com/new';
      const shortCode = generateShortCode();
      const newUrl = new UrlShortener();
      newUrl.originalUrl = originalUrl;
      newUrl.shortCode = shortCode;

      mockUrlShortenerRepository.findOne.mockResolvedValue(null);
      mockUrlShortenerRepository.create.mockReturnValue(newUrl);
      mockUrlShortenerRepository.save.mockResolvedValue(newUrl);

      const result = await service.shortenUrl(originalUrl);
      expect(result).toEqual(newUrl);
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { originalUrl },
      });
      expect(mockUrlShortenerRepository.create).toHaveBeenCalledWith({
        originalUrl,
        shortCode: expect.any(String),
      });
      expect(mockUrlShortenerRepository.save).toHaveBeenCalledWith(newUrl);
    });
  });

  describe('getUrlByShortCode', () => {
    it('should return URL if short code exists', async () => {
      const shortCode = 'abcd12';
      const urlEntity = new UrlShortener();
      urlEntity.originalUrl = 'https://example.com';
      urlEntity.shortCode = shortCode;

      mockUrlShortenerRepository.findOne.mockResolvedValue(urlEntity);

      const result = await service.getUrlByShortCode(shortCode);
      expect(result).toEqual(urlEntity);
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
    });

    it('should return null if short code does not exist', async () => {
      mockUrlShortenerRepository.findOne.mockResolvedValue(null);

      const result = await service.getUrlByShortCode('invalid123');
      expect(result).toBeNull();
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'invalid123' },
      });
    });
  });

  describe('getUrlByOriginalUrl', () => {
    it('should return URL if original URL exists', async () => {
      const originalUrl = 'https://example.com';
      const urlEntity = new UrlShortener();
      urlEntity.originalUrl = originalUrl;
      urlEntity.shortCode = 'abcd12';

      mockUrlShortenerRepository.findOne.mockResolvedValue(urlEntity);

      const result = await service.getUrlByOriginalUrl(originalUrl);
      expect(result).toEqual(urlEntity);
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { originalUrl },
      });
    });

    it('should return null if original URL does not exist', async () => {
      mockUrlShortenerRepository.findOne.mockResolvedValue(null);

      const result = await service.getUrlByOriginalUrl('https://notfound.com');
      expect(result).toBeNull();
      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { originalUrl: 'https://notfound.com' },
      });
    });
  });

  describe('incrementAccessCount', () => {
    it('should increment visit count if short code exists', async () => {
      const shortCode = 'abcd12';
      const urlEntity = new UrlShortener();
      urlEntity.originalUrl = 'https://example.com';
      urlEntity.shortCode = shortCode;
      urlEntity.visits = 5;

      mockUrlShortenerRepository.findOne.mockResolvedValue(urlEntity);
      mockUrlShortenerRepository.save.mockResolvedValue({
        ...urlEntity,
        visits: 6,
      });

      await service.incrementAccessCount(shortCode);

      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
      expect(mockUrlShortenerRepository.save).toHaveBeenCalledWith({
        ...urlEntity,
        visits: 6,
      });
    });

    it('should do nothing if short code does not exist', async () => {
      mockUrlShortenerRepository.findOne.mockResolvedValue(null);

      await service.incrementAccessCount('invalid123');

      expect(mockUrlShortenerRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'invalid123' },
      });
      expect(mockUrlShortenerRepository.save).not.toHaveBeenCalled();
    });
  });
});
