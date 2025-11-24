import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type CourtDocument = Court & Document;

@Schema({ timestamps: true })
export class Court {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surfaceType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  defaultPricePerHour: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CourtSchema = SchemaFactory.createForClass(Court);

// Compound unique index: a court name must be unique within a club
CourtSchema.index({ clubId: 1, name: 1 }, { unique: true });
CourtSchema.index({ clubId: 1, isActive: 1 });
