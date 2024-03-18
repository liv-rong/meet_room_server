import { Global, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { createClient } from "redis";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: "REDIS_CLIENT",
      async useFactory(configService: ConfigService) {
        console.log(configService.get("redis_server_host"));
        console.log(configService.get("redis_server_port"));

        const client = createClient({
          // url: "redis://client:6379",
          // legacyMode: true,
          socket: {
            // host: configService.get("redis_server_host"),
            // port: configService.get("redis_server_port"),
            // host: 'localhost',
            // port: 6379,
            port: 6379,
            host: "redis-container",
          },
          database: configService.get("redis_server_db"),
        });
        client.on("error", (err) => console.error("Redis client err", err));
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
