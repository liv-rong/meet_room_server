import { Module } from '@nestjs/common';
import { QrcodeLoginService } from './qrcode-login.service';
import { QrcodeLoginController } from './qrcode-login.controller';

@Module({
  controllers: [QrcodeLoginController],
  providers: [QrcodeLoginService],
})
export class QrcodeLoginModule {}
