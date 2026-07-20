import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
    }),
    MongooseModule.forRoot(process.env.MONGO_DB!, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () =>
          console.log('DataBase Connected Successfully '),
        );
        return connection;
      },
    }),

    UserModule,

    BrandModule,

    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
