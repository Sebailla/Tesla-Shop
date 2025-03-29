import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';



@Injectable()
export class SeedService {

  constructor(

    private readonly productsServices: ProductsService,

  ) { }

  async runSeed() {

    await this.insertNewProducts();

    return 'Seed executed';
  }

  private async insertNewProducts() {
    await this.productsServices.deleteAllProducts()

    // Insert new products here from a file or API call...

    const products = initialData.products
    const insertPromises: Promise<any>[] = []

    products.forEach(product => {
      insertPromises.push(this.productsServices.create(product))
    })

    await Promise.all(insertPromises)

    return true
  }
}
