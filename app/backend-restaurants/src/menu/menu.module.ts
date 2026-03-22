import { Module } from '@nestjs/common';
import { CategoriesModule } from './sub-modules/categories/categories.module';
import { ProductsModule } from './sub-modules/products/products.module';

@Module({
  imports: [CategoriesModule, ProductsModule],
  exports: [CategoriesModule, ProductsModule],
})
export class MenuModule {}
