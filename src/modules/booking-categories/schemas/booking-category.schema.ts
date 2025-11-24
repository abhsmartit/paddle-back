import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type BookingCategoryDocument = BookingCategory & Document;

@Schema({ timestamps: true })
export class BookingCategory {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  colorHex: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookingCategorySchema = SchemaFactory.createForClass(BookingCategory);

// Indexes
BookingCategorySchema.index({ clubId: 1, isActive: 1 });
BookingCategorySchema.index({ clubId: 1, name: 1 });
