import { BeforeInsert, BeforeUpdate, Column, Entity, LegacyOracleNamingStrategy, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-images.entity";
import { User } from "src/auth/entities/user.entity"
import { ManyToOne } from "typeorm"
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '01e3cc7e-1659-485f-b000-93e6452890e9',
        description: 'Product ID',
        uniqueItems: true,
        nullable: false
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'Men’s 3D Small Wordmark Tee',
        description: 'Product Title',
        uniqueItems: true,
        nullable: false
    })
    @Column('text', {
        unique: true,
        nullable: false,
    })
    title: string

    @ApiProperty({
        example: 'Designed for comfort and style in any size, the Tesla Small Wordmark Tee is made from 100% Peruvian cotton .',
        description: 'Product Description',
        nullable: true
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 90.99,
        description: 'Product Price',
        default:0
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'men_3d_small_wordmark_tee',
        description: 'Product SLUG - for SEO',
        uniqueItems: true,
        nullable: true
    })
    @Column('text', {
        unique: true,
        nullable: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        description: 'Product Sizes',
        nullable: true
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'men',
        description: 'Product Gender',
        nullable: true
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['T-Shirt', 'Shirt', 'Jacket'],
        description: 'Product Tags',
        nullable: true
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // images

    @OneToMany(
        () => ProductImage,
        (productImage: ProductImage) => productImage.product,
        { cascade: true, eager: true },
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    // Normaliza el valor del slug antes de insertar

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replace(/ /g, '_') // Uso de `replace` en lugar de `replaceAll` para mayor compatibilidad.
            .replace(/'/g, '');
    }

    // Normaliza el valor de tags antes de insertar
    @BeforeInsert()
    checkTagsInsert() {
        if (this.tags) {
            this.tags = this.tags.map(tag => tag.toLowerCase()
        .replace(/ /g, '')
        .replace(/'/g, ''));
        }
    }

    // Normaliza el valor del slug antes de actualizar
    @BeforeUpdate()
    checkSlugUpdate() {
        if (this.slug) {
            this.slug = this.slug
                .toLowerCase()
                .replace(/ /g, '_')
                .replace(/'/g, '');
        }
    }

    // Normaliza el valor de tags antes de actualizar
    @BeforeUpdate()
    checkTagsUpdate() {
        if (this.tags) {
            this.tags = this.tags.map(tag => tag.toLowerCase());
        }
    }

}