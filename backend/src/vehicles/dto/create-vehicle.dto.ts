import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MinLength(1)
  make: string;

  @IsString()
  @MinLength(1)
  model: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
