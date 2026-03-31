import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentsModule } from './payments/payments.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';

import { User, Property, RentalApplication, Message, Payment, MarketplaceItem, Review, Report } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'bariwala'),
        entities: [User, Property, RentalApplication, Message, Payment, MarketplaceItem, Review, Report],
        synchronize: true, // Auto-create tables in dev — disable in production
      }),
    }),
    AuthModule,
    PropertiesModule,
    MessagesModule,
    PaymentsModule,
    MarketplaceModule,
    ReviewsModule,
    ReportsModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
