import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Provider } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

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

  findAll() {
    return this.productRepository.find({});
  }

  async findOne(id: string) {

    let findProductById = await this.productRepository.findOneBy({ id });

    if (!findProductById)
      throw new NotFoundException(`Product with ${id} not found`);
    
    
    return findProductById;

  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
