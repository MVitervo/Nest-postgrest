import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Provider } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { title } from 'process';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ){}

  async create(createProductDto: CreateProductDto) {

    try {      

      const product = this.productRepository.create(createProductDto); // creo el registro
      await this.productRepository.save(product); // lo guarda en la base de datos

      return product;

    } catch (error) {
      this.handleExcepton(error);
    }
    
  }

  private handleExcepton(error) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    // console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  findAll(paginationDto: paginationDto) {

    const { limit = 10, offset = 0 } = paginationDto // valores por defecto

    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO relaciones
    });
  }

  async findOne(term: string) {

    /*
    let findProductById = await this.productRepository.findOneBy({ id });

    if (!findProductById)
      throw new NotFoundException(`Product with ${id} not found`);
    
    
    return findProductById;
    */
    let product: Product | null = null

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    }
    else {
      // product = await this.productRepository.findOneBy({slug: term});

      const queryBuilder = this.productRepository.createQueryBuilder()
      product = await queryBuilder.where('UPPER(title) = :title or slug = :slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      }).getOne() // este getOne sirve para obtener solo un resultado ya que puede regresar mas de 1 regtistro
    }

    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);
    
    
    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {


    const product = await this.findOne(id);

    try {
      // continuar ya funciona, pero quiero mejorarlo
      await this.productRepository.update(id, updateProductDto)
      return updateProductDto
      /*
      await pokemon.updateOne(updatePokemonDto, {new: true});
      return { ...pokemon.toJSON(), ...updatePokemonDto };
      */

    } catch (error) {
      this.handleExcepton(error)
    }

    // return `This action updates a #${id} product`;
  }

  async remove(id: string) {

    // const removeProductById = await this.productRepository.delete(id)

    // if (removeProductById.affected === 0) {
    //   throw new BadRequestException(`Invalid register ${id}`)
    // }

    // return removeProductById;
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }
}
