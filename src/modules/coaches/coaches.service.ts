import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coach, CoachDocument } from './schemas/coach.schema';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(@InjectModel(Coach.name) private coachModel: Model<CoachDocument>) {}

  async create(clubId: string, createCoachDto: CreateCoachDto): Promise<Coach> {
    const coach = new this.coachModel({
      ...createCoachDto,
      clubId,
    });
    return coach.save();
  }

  async findByClub(clubId: string, activeOnly = false): Promise<Coach[]> {
    const query: any = { clubId };
    if (activeOnly) {
      query.isActive = true;
    }
    return this.coachModel.find(query).exec();
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachModel.findById(id).exec();
    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }
    return coach;
  }

  async update(id: string, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const coach = await this.coachModel
      .findByIdAndUpdate(id, updateCoachDto, { new: true })
      .exec();
    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }
    return coach;
  }

  async remove(id: string): Promise<void> {
    const result = await this.coachModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }
  }
}
