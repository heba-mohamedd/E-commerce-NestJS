import { Length, IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 300)
  slogan: string;
}
