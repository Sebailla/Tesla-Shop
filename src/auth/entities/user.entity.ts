import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true,
    })
    email: string

    @Column('text', {
        nullable: false,
        select: false
    })
    password: string

    @Column('text')
    name: string

    @Column('text')
    lastName: string

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[]

    @Column('bool', {
        default: true
    })
    isActive: boolean

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    product: Product
    

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim()
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim()
    }
}
