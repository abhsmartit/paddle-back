import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Club, ClubDocument } from './schemas/club.schema';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(@InjectModel(Club.name) private clubModel: Model<ClubDocument>) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    const club = new this.clubModel(createClubDto);
    return club.save();
  }

  async findAll(): Promise<Club[]> {
    return this.clubModel.find().exec();
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.clubModel.findById(id).exec();
    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }
    return club;
  }

  async update(id: string, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.clubModel
      .findByIdAndUpdate(id, updateClubDto, { new: true })
      .exec();
    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }
    return club;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clubModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }
  }
}
