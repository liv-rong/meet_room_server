import { Module } from '@nestjs/common';
import { LargeFileService } from './large-file.service';
import { LargeFileController } from './large-file.controller';

@Module({
  controllers: [LargeFileController],
  providers: [LargeFileService],
})
export class LargeFileModule {}
