import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./index";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true // se indica que el titulo debe de ser unico
    })
    title: string

    @Column('float', {
        default: 0
    })
    price: number

    @Column({
        type: 'text',
        nullable: true
    })
    description: string

    @Column('text', {
        unique: true // se indica que el slug debe de ser unico
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text')
    gender: string

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    @OneToMany(
        () =>  ProductImage, // indica que regresa un productimage
        (productImage) => productImage.product, // indica la propiedad con la que se relaciona en la otra entidad
        {cascade: true} // indica que afecte a la otra tabla al hacer una operacion
        // por ejemplo la eliminacion de un registro de la tabla product elmina las 
        // imagenes si es que hay
    )
    images?: ProductImage[]

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }
        
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {        
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
