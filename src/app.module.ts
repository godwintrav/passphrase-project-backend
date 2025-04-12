import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entity/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Analytic } from './entity/analytics.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DB_HOST:', config.get<string>('DB_HOST'));
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [User, Analytic],
          synchronize: config.get<string>('NODE_ENV') == 'production' ? false : true,
        ssl: config.get<boolean>('DB_SSL')
          ? {
              rejectUnauthorized: config.get<string>('DB_SSL_REJECT_UNAUTHORIZED') === 'false' ? false : true,
            }
          : false,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Analytic])
  ],

  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
