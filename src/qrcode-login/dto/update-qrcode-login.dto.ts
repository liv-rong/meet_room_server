import { PartialType } from '@nestjs/swagger';
import { CreateQrcodeLoginDto } from './create-qrcode-login.dto';

export class UpdateQrcodeLoginDto extends PartialType(CreateQrcodeLoginDto) {}
