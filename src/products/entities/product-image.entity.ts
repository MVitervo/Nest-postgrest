import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from ".";


@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn() // por defecto incrementa de 1 en 1
    id: number

    @Column('text')
    url: string

    @ManyToOne(
        () => Product,
        (product) => product.images
    )
    product: Product
}

