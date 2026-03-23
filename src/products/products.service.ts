import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Provider } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { DataSource } from 'typeorm/browser';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ){}

  async create(createProductDto: CreateProductDto) {

    // aqui los ... es el operador rest
    const { images = [], ...productDetails } = createProductDto;

    try {
      // aqui los ... es el operador spread depende de como se usen
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image}))
      }); // creo el registro
      await this.productRepository.save(product); // lo guarda en la base de datos

      return {...product, images};

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

  async findAll(paginationDto: paginationDto) {

    const { limit = 10, offset = 0 } = paginationDto // valores por defecto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images?.map(image => image.url)
    }))
  }

  async findOne(term: string) {
    let product: Product | null = null

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    }
    else {
      // product = await this.productRepository.findOneBy({slug: term});

      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder.where('UPPER(title) = :title or slug = :slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne() // este getOne sirve para obtener solo un resultado ya que puede regresar mas de 1 regtistro

    }

    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);

    return product;

  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term)

    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({
      ...toUpdate,
      images: []
    }); // el preload es cargar todas las propiedades


    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    } 

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await this.productRepository.save(product)
      return product

    } catch(error) {
      this.handleExcepton(error)
    }

    return product

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
