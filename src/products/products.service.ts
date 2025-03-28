import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUUID } from 'uuid'

@Injectable()
export class ProductsService {

  //* -  LOGGERS

  private readonly logger = new Logger('ProductService')

  //? -  CONTRUCTORS

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }


  //todo -  CREATE PRODUCTS

  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product)

      return {
        status: 'success',
        message: 'Product created successfully',
        product: product
      }

    } catch (error) {
      this.handlerExceptions(error);
    }

  }


  //todo -  FIND ALL PRODUCTS AND PAGINATED

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {}
    })
    return {
      status: 'success',
      products: products
    }
  }


  //todo -  FIND PRODUCT BY ID

  async findOne(term: string) {

    let product: Product | null

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      //product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder()
      product = await queryBuilder
        .where('UPPER(title) =:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne()
    }

    if (!product) {
      throw new BadRequestException(`Product wiyh is:${term} not found`)
    }

    return {
      status: 'success',
      product: product
    }
  }

  //todo -  UPDATE PRODUCTS

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    }

    // Si el campo "tags" se proporciona, lo asignamos explícitamente.
  if (updateProductDto && Array.isArray(updateProductDto.tags)) {
    product.tags = updateProductDto.tags;
  }

    try {

      await this.productRepository.save(product)
      return product

    } catch (error) {

      this.handlerExceptions(error)
    }

  }


  //todo -  DELETE PRODUCTS

  async remove(id: string) {

    const { product } = await this.findOne(id)
    await this.productRepository.remove(product)

    return {
      status: 'success',
      message: `Product with id: ${id} deleted successfully`,
      product: product
    }

  }


  //! -  MANEJO DE ERRORES

  private handlerExceptions(error: any) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }

}
