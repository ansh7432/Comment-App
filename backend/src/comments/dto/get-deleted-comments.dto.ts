import { IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetDeletedCommentsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
