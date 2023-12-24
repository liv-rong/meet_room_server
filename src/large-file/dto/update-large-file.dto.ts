import { PartialType } from '@nestjs/swagger';
import { CreateLargeFileDto } from './create-large-file.dto';

export class UpdateLargeFileDto extends PartialType(CreateLargeFileDto) {}
