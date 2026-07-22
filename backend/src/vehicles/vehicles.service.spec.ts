import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './schemas/vehicle.schema';

describe('VehiclesService', () => {
  let service: VehiclesService;

  const mockVehicle = {
    _id: 'vehicle-id-1',
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: 22000,
    quantity: 5,
    save: jest.fn(),
  };

  const mockVehicleModel: any = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    mockVehicleModel.find = jest.fn();
    mockVehicleModel.findById = jest.fn();
    mockVehicleModel.findByIdAndUpdate = jest.fn();
    mockVehicleModel.findByIdAndDelete = jest.fn();
    mockVehicleModel.mockImplementation((doc: any) => ({
      ...doc,
      _id: 'vehicle-id-1',
      save: jest.fn().mockResolvedValue({ ...doc, _id: 'vehicle-id-1' }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: getModelToken(Vehicle.name), useValue: mockVehicleModel },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  describe('create', () => {
    it('creates and persists a new vehicle', async () => {
      const dto = {
        make: 'Toyota',
        model: 'Corolla',
        category: 'Sedan',
        price: 22000,
        quantity: 5,
      };

      const result = await service.create(dto as any);

      expect(mockVehicleModel).toHaveBeenCalledWith(dto);
      expect(result.make).toBe('Toyota');
    });
  });

  describe('findAll', () => {
    it('returns all vehicles', async () => {
      mockVehicleModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockVehicle]) });

      const result = await service.findAll();

      expect(result).toEqual([mockVehicle]);
    });
  });

  describe('search', () => {
    it('builds a mongo filter from make, category and price range', async () => {
      mockVehicleModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockVehicle]) });

      await service.search({ make: 'Toyota', category: 'Sedan', minPrice: 10000, maxPrice: 30000 });

      expect(mockVehicleModel.find).toHaveBeenCalledWith({
        make: { $regex: 'Toyota', $options: 'i' },
        category: { $regex: 'Sedan', $options: 'i' },
        price: { $gte: 10000, $lte: 30000 },
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the vehicle does not exist', async () => {
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the vehicle when found', async () => {
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockVehicle) });

      const result = await service.findOne('vehicle-id-1');

      expect(result).toEqual(mockVehicle);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when updating a missing vehicle', async () => {
      mockVehicleModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.update('missing-id', { price: 100 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the updated vehicle', async () => {
      mockVehicleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockVehicle, price: 25000 }),
      });

      const result = await service.update('vehicle-id-1', { price: 25000 } as any);

      expect(result.price).toBe(25000);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when deleting a missing vehicle', async () => {
      mockVehicleModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('deletes an existing vehicle', async () => {
      mockVehicleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVehicle),
      });

      await expect(service.remove('vehicle-id-1')).resolves.toBeUndefined();
    });
  });

  describe('purchase', () => {
    it('throws BadRequestException when quantity is zero', async () => {
      const outOfStock = { ...mockVehicle, quantity: 0, save: jest.fn() };
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(outOfStock) });

      await expect(service.purchase('vehicle-id-1')).rejects.toThrow(BadRequestException);
    });

    it('decrements quantity by one on purchase', async () => {
      const inStock = { ...mockVehicle, quantity: 5, save: jest.fn().mockResolvedValue(true) };
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inStock) });

      const result = await service.purchase('vehicle-id-1');

      expect(inStock.quantity).toBe(4);
      expect(inStock.save).toHaveBeenCalled();
      expect(result.quantity).toBe(4);
    });

    it('throws NotFoundException when the vehicle does not exist', async () => {
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.purchase('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restock', () => {
    it('increments quantity by the given amount', async () => {
      const existing = { ...mockVehicle, quantity: 5, save: jest.fn().mockResolvedValue(true) };
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

      const result = await service.restock('vehicle-id-1', 3);

      expect(existing.quantity).toBe(8);
      expect(result.quantity).toBe(8);
    });

    it('throws BadRequestException for a non-positive restock amount', async () => {
      const existing = { ...mockVehicle, quantity: 5, save: jest.fn() };
      mockVehicleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

      await expect(service.restock('vehicle-id-1', 0)).rejects.toThrow(BadRequestException);
    });
  });
});
