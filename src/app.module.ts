import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [

    ConfigModule.forRoot({
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : (() => {
        throw new Error("DB_PORT is not defined in environment variables.");
      })(),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      //rootPath: `${__dirname}/../public`,
      rootPath: join(__dirname, '..', 'public'),
    }),
    

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
