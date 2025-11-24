import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { randomUUID } from 'crypto';
import { DayOfWeek } from '@/common/enums';

export type ClubDocument = Club & Document;

class Location {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ type: { type: String, default: 'Point' } })
  type?: string;

  @Prop({ type: [Number] })
  coordinates?: number[]; // [longitude, latitude]
}

class OpeningHours {
  @Prop({ type: String, enum: DayOfWeek, required: true })
  dayOfWeek: DayOfWeek;

  @Prop({ required: true })
  openTime: string; // Format: "HH:MM"

  @Prop({ required: true })
  closeTime: string; // Format: "HH:MM"
}

@Schema({ timestamps: true })
export class Club {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop({ required: true, default: 'UTC' })
  timeZone: string;

  @Prop({ type: [OpeningHours], default: [] })
  openingHours: OpeningHours[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ClubSchema = SchemaFactory.createForClass(Club);

// Indexes
ClubSchema.index({ name: 1 });
ClubSchema.index({ 'location.coordinates': '2dsphere' });
