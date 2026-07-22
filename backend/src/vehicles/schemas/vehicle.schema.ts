import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, trim: true })
  make: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ required: true, trim: true })
  category: string; // e.g. Sedan, SUV, Truck, Coupe, Convertible

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, default: 0 })
  quantity: number;

  @Prop({ default: null })
  year?: number;

  @Prop({ default: null })
  imageUrl?: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

// Support text search plus fast lookups by the fields we filter/search on.
VehicleSchema.index({ make: 'text', model: 'text' });
VehicleSchema.index({ category: 1 });
VehicleSchema.index({ price: 1 });
