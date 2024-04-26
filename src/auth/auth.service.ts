import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import { RedisService } from "src/redis/redis.service";

import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { md5 } from "src/utils";
import { UserService } from "src/user/user.service";
import { LoginDto } from "./dto/login.dto";
import { LoginVo } from "./vo/login.vo";

import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthUserDto } from "./dto/auth-user.dto";
import { UpdateUserPasswordDto } from "./dto";

@Injectable()
export class AuthService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  async signup(user: SignupDto) {
    // const captcha = await this.redisService.get(`captcha_${user.email}`);
    // console.log(captcha, "captcha");
    // if (!captcha)
    //   throw new HttpException("验证码已失效", HttpStatus.BAD_REQUEST);

    // if (user.captcha !== captcha)
    //   throw new HttpException("验证码不正确", HttpStatus.BAD_REQUEST);

    const findUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (findUser) throw new HttpException("用户已存在", HttpStatus.BAD_REQUEST);

    const { username, password, email, nickName } = user;
    const newUser = new User();
    newUser.username = username;
    newUser.password = md5(password);
    newUser.email = email;
    newUser.nickName = nickName;

    try {
      await this.userRepository.save(newUser);
      return "注册成功";
    } catch (e) {
      this.logger.error(e, UserService);
      return "注册失败";
    }
  }

  async login(login: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: login.username,
      },
      relations: ["roles", "roles.permissions"],
    });

    if (!user) throw new HttpException("用户不存在", HttpStatus.BAD_REQUEST);

    if (user.password !== md5(login.password))
      throw new HttpException("密码错误", HttpStatus.BAD_REQUEST);

    const vo = new LoginVo();

    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  //获取登录的时候个人信息 权限认证
  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ["roles", "roles.permissions"],
    });
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  // 生成 access token
  generateAccessToken(authUser: AuthUserDto) {
    return this.jwtService.sign(
      {
        ...authUser,
      },
      {
        expiresIn:
          this.configService.get("jwt_access_token_expires_time") || "30m",
      },
    );
  }

  // 生成 refresh token
  generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      {
        userId,
      },
      {
        expiresIn:
          this.configService.get("jwt_refresh_token_expres_time") || "7d",
      },
    );
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException("验证码已失效", HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: passwordDto.username,
    });
    console.log(foundUser, "foundUser");
    if (foundUser.email !== passwordDto.email) {
      throw new HttpException("邮箱不正确", HttpStatus.BAD_REQUEST);
    }

    foundUser.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(foundUser);
      return "密码修改成功";
    } catch (e) {
      this.logger.error(e, UserService);
      return "密码修改失败";
    }
  }
}
