import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-images.entity";

@Entity({name: 'products'})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true,
        nullable: false,
    })
    title: string

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true,
        nullable: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

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