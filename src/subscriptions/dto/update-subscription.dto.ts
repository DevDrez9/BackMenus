import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { IsEnum, IsOptional } from 'class-validator';

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIAL = 'TRIAL',
}

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;
}