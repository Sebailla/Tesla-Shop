import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUUID } from 'uuid'
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  //* -  LOGGERS

  private readonly logger = new Logger('ProductService')

  //? -  CONTRUCTORS

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) { }


  //todo -  CREATE PRODUCTS

  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map(image => this.productImageRepository.create({ url: image })),
      })

      await this.productRepository.save(product)

      return {
        status: 'success',
        message: 'Product created successfully',
        product: {
          ...product,
          images: images
        }
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
      relations: {
        images: true,
      }
    })

    return products.map(product => ({
      ...product,
      images: product.images?.map(img => img.url)
    }))
  }


  //todo -  FIND PRODUCT BY ID

  async findOne(term: string) {

    let product: Product | null

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      //product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'productImages')
        .getOne()
    }

    if (!product) {
      throw new BadRequestException(`Product wiyh is:${term} not found`)
    }

    return product
  }

  //? Plaining returns:

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  //todo -  UPDATE PRODUCTS

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...rest } = updateProductDto

    const product = await this.productRepository.preload({ id, ...rest })

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    }

    // Si el campo "tags" se proporciona, lo asignamos explícitamente.
    if (updateProductDto && Array.isArray(updateProductDto.tags)) {
      product.tags = updateProductDto.tags;
    }

    //* Create query runner --------------------------------

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {

      // Actualizamos las imágenes

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } })

        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        )
      }else{
        //product.images = []
      }

      // Actualizamos el producto

      product.user = user
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()
      //await this.productRepository.save(product)
      return this.findOnePlain(id)

    } catch (error) {

      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      this.handlerExceptions(error)
    }
    //*----------------------------------------------------------------
  }


  //todo -  DELETE PRODUCTS

  async remove(id: string) {

    const product = await this.findOne(id)
    await this.productRepository.remove(product)

    return {
      status: 'success',
      message: `Product with id: ${id} deleted successfully`,
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

    //! -  ELIMINACION DE TODOS LOS DTOS DE LA BASE DE DATOS
  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
        .delete()
        .where({})
        .execute()
    } catch (error) {
      this.handlerExceptions(error)
    }
  } 

}
