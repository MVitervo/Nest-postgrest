import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, // carga en automatico las entidades que vamos definiendo poco a poco
      synchronize: true // este no se suele pasar a prd ya que la funcion de esto es que si en dev borramos registros
      // quitamos o agregramos columnas afectara inmediatamente a prd al subir los cambias con esta propiedad activada
    })
  ]
})
export class AppModule {}