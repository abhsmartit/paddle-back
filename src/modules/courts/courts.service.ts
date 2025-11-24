import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Court, CourtDocument } from './schemas/court.schema';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {
  constructor(@InjectModel(Court.name) private courtModel: Model<CourtDocument>) {}

  async create(clubId: string, createCourtDto: CreateCourtDto): Promise<Court> {
    try {
      const court = new this.courtModel({
        ...createCourtDto,
        clubId,
      });
      return await court.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Court with name "${createCourtDto.name}" already exists in this club`,
        );
      }
      throw error;
    }
  }

  async findByClub(clubId: string): Promise<Court[]> {
    console.log(clubId ,"clubId");
    const courts = await this.courtModel.find({ clubId }).exec();
    console.log(courts ,"courts");
    
    return courts;
  }

  async findOne(id: string): Promise<Court> {
    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }
    return court;
  }

  async update(id: string, updateCourtDto: UpdateCourtDto): Promise<Court> {
    const court = await this.courtModel
      .findByIdAndUpdate(id, updateCourtDto, { new: true })
      .exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }
    return court;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courtModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }
  }
}
