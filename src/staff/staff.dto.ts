import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class StaffDto {
  @IsNotEmpty({ message: "field 'name' cannot be empty" })
  @IsString({ message: "field 'name' must be a string" })
  public name: string;

  @IsNotEmpty({ message: "field 'baseSalary' cannot be empty" })
  @IsNumber({}, { message: "field 'baseSalary' must be a number" })
  public baseSalary: number;

  @IsNotEmpty({ message: "field 'joinDate' cannot be empty" })
  @IsISO8601({}, { message: "field 'joinDate' must be an ISO8601 string" })
  public joinDate: Date | string;

  @IsOptional()
  @IsNumber({}, { message: "field 'supervisor_id' must be a number" })
  public supervisor_id?: number | null;

  @IsOptional()
  @IsString({ message: "field 'subordinates_id' must be a string" })
  public subordinates_id?: string | null;

}