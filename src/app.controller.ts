import { Controller, Get, Inject, Param, Sse } from "@nestjs/common";
import { AppService } from "./app.service";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";
import { exec } from "child_process";
// import { readFileSync } from 'fs'
import { RedisService } from "src/redis/redis.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Sse("stream")
  stream() {
    return new Observable((observer) => {
      observer.next({ data: { msg: "aaa" } });

      setTimeout(() => {
        observer.next({ data: { msg: "bbb" } });
      }, 2000);

      setTimeout(() => {
        observer.next({ data: { msg: "ccc" } });
      }, 5000);
    });
  }

  @Sse("stream2")
  stream2() {
    const childProcess = exec("tail -f ./log");

    return new Observable((observer) => {
      childProcess.stdout.on("data", (msg) => {
        observer.next({ data: { msg: msg.toString() } });
      });
    });
  }

  @Get("redis/:id")
  async getHello(@Param("id") id: number): Promise<string> {
    console.log(id, "id11111111");
    // const handleId = id.toString() ?? '11111'
    await this.redisService.set(`captcha_11111`, "handleId", 5 * 60);
    const res = await this.redisService.get(`captcha_11111`);
    return `Hello World!${res} +++ ${id}`;
  }

  @Get("/sww/:id")
  getHello2(@Param("id") id: string): string {
    return `Hello World!${id}`;
  }

  @Get()
  getHello3(): string {
    return `Hello World11111`;
  }

  // @Sse('stream3')
  // stream3() {
  //   return new Observable((observer) => {
  //     const json = readFileSync('./package.json').toJSON()
  //     observer.next({ data: { msg: json } })
  //   })
  // }
}
