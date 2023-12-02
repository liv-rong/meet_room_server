export const jwtConstants = {
  secret: 'leeKey', // 密钥
  expiresIn: '60s' // token有效时间
}

export class JWTModel {
  id: number

  username: string
}
