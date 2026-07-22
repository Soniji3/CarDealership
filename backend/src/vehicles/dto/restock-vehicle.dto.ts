import { IsInt, Min } from 'class-validator';

export class RestockVehicleDto {
  @IsInt()
  @Min(1)
  amount: number;
}
