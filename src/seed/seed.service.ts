import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';



@Injectable()
export class SeedService {

  constructor(

    private readonly productsServices: ProductsService,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) { }

  async runSeed() {

    //Borrar Tablas
    await this.deleteTable();
    //Insertar Users
    const adminUser = await this.insertNewUsers();
    //Insertar Productos
    await this.insertNewProducts(adminUser);

    return 'Seed executed successfully';
  }

  private async deleteTable(){

    await this.productsServices.deleteAllProducts()

    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertNewUsers() {

    const seedUsers = initialData.users

    const users: User[] = []

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    })

    const dbUsers = await this.userRepository.save(seedUsers)

    return dbUsers[0]


  }

  private async insertNewProducts(adminUser: User) {
    await this.productsServices.deleteAllProducts()

    // Insert new products here from a file or API call...

    const products = initialData.products
    const insertPromises: Promise<any>[] = []

    products.forEach(product => {
      insertPromises.push(this.productsServices.create(product, adminUser))
    })

    await Promise.all(insertPromises)

    return true
  }
}
