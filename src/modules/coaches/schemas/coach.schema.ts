import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type CoachDocument = Coach & Document;

@Schema({ timestamps: true })
export class Coach {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  hourlyRate: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CoachSchema = SchemaFactory.createForClass(Coach);

// Indexes
CoachSchema.index({ clubId: 1, isActive: 1 });
CoachSchema.index({ userId: 1 });
