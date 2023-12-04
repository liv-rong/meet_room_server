import { BadRequestException, ParseIntPipe } from '@nestjs/common'

export function generateParseIntPipe(name) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(name + ' 应该传数字')
    }
  })
}
