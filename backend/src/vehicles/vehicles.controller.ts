import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';
import { RestockVehicleDto } from './dto/restock-vehicle.dto';

@Controller('api/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  // NOTE: this route must be declared before ':id' so "search" isn't
  // swallowed by the dynamic id param.
  @Get('search')
  search(@Query() query: SearchVehicleDto) {
    return this.vehiclesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  @Post(':id/purchase')
  purchase(@Param('id') id: string) {
    return this.vehiclesService.purchase(id);
  }

  @Post(':id/restock')
  @Roles(Role.ADMIN)
  restock(@Param('id') id: string, @Body() dto: RestockVehicleDto) {
    return this.vehiclesService.restock(id, dto.amount);
  }
}
