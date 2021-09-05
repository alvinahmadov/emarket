import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	Param,
	Post,
	Put,
	Req,
	UseGuards
}                                             from '@nestjs/common';
import { ApiBearerAuth, ApiTags }             from '@nestjs/swagger';
import { AuthGuard }                          from '@nestjs/passport';
import { CreateProductDto, UpdateProductDto } from './ProductsDto';
import { ProductsService }                    from '../../services/products';

@ApiTags('product')
@Controller('product')
export class ProductController
{
	constructor(private productsService: ProductsService) {}
	
	@Get()
	@Header('Cache-Control', 'none')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	findAll(@Req() request)
	{
		return this.productsService.find({});
	}
	
	@Get(':id')
	async findOne(@Param('id') id: string)
	{
		return await this.productsService.getCurrent(id);
	}
	
	@Post(':id')
	async create(@Body() createInfo: CreateProductDto)
	{
		return this.productsService.create(createInfo);
	}
	
	@Put(':id')
	update(
			@Param('id') id: string,
			@Body() updateInfo: UpdateProductDto
	)
	{
		return `Here updates a #${id} product`;
	}
	
	@Delete('id')
	remove(@Param('id') id: string)
	{
		return `Here removes a #${id} product`;
	}
}
