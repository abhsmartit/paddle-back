import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { randomUUID } from 'crypto';
import { UserRole } from '@/common/enums';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.RECEPTIONIST] })
  roles: UserRole[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for performance
UserSchema.index({ email: 1 });
