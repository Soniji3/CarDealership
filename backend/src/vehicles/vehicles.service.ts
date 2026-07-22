import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(dto: CreateVehicleDto): Promise<VehicleDocument> {
    const vehicle = new this.vehicleModel(dto);
    return vehicle.save();
  }

  async findAll(): Promise<VehicleDocument[]> {
    return this.vehicleModel.find().exec();
  }

  async search(query: SearchVehicleDto): Promise<VehicleDocument[]> {
    const filter: Record<string, any> = {};

    if (query.make) {
      filter.make = { $regex: query.make, $options: 'i' };
    }
    if (query.model) {
      filter.model = { $regex: query.model, $options: 'i' };
    }
    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    return this.vehicleModel.find(filter).exec();
  }

  async findOne(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" was not found`);
    }
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleDocument> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Vehicle with id "${id}" was not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Vehicle with id "${id}" was not found`);
    }
  }

  /** Decrements stock by one. Rejects when the vehicle is out of stock. */
  async purchase(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" was not found`);
    }
    if (vehicle.quantity <= 0) {
      throw new BadRequestException('This vehicle is out of stock');
    }
    vehicle.quantity -= 1;
    await vehicle.save();
    return vehicle;
  }

  /** Increments stock by the given positive amount (admin only). */
  async restock(id: string, amount: number): Promise<VehicleDocument> {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Restock amount must be a positive number');
    }
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" was not found`);
    }
    vehicle.quantity += amount;
    await vehicle.save();
    return vehicle;
  }
}
