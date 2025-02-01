// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlShortenerController } from './modules/url-shortener/url-shortener.controller';
import { UrlShortenerService } from './modules/url-shortener/url-shortener.service';
import { UrlShortenerModule } from './modules/url-shortener/url-shortener.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb+srv://houucempro:Kjv5HonSPQysCh2n@cluster0.xw7df.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    UrlShortenerModule,
  ],
  controllers: [UrlShortenerController],
})
export class AppModule {}
