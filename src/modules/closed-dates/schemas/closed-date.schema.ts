import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type ClosedDateDocument = ClosedDate & Document;

@Schema({ timestamps: true })
export class ClosedDate {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId: Types.ObjectId;

  @Prop({ required: true, type: Date, index: true })
  closedDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdByUserId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ClosedDateSchema = SchemaFactory.createForClass(ClosedDate);

// Compound indexes
ClosedDateSchema.index({ clubId: 1, closedDate: 1 });
