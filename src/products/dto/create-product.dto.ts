import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"


export class CreateProductDto {

    @ApiProperty({
        description: 'Product Title (unique)',
        nullable: false,
        minLength: 3
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title: string

    @ApiProperty({
        description: 'Product Price',
        default: 0
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number

    @ApiProperty({
        description: 'Product Description',
        nullable: true
    })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({
        description: 'Product Slug',
        nullable: true
    })
    @IsString()
    @IsOptional()
    slug?: string

    @ApiProperty({
        description: 'Product Stock',
        default: 0,
        nullable: true
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number

    @ApiProperty({
        description: 'Product Sizes',
        nullable: false
    })
    @IsString({ each: true })
    @IsArray()
    sizes: string[]

    @ApiProperty({
        description: 'Product Gender',
        nullable: false
    })
    @IsIn(["men", "women", "kid", "unisex"])
    gender?: string

    @ApiProperty({
        description: 'Product Tags',
        nullable: true
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[]

    @ApiProperty({
        description: 'Product Images',
        nullable: true
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]

}
