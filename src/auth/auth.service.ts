import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  //* -  LOGGERS

  private readonly logger = new Logger('AuthService')

  //? -  CONTRUCTORS

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService

  ) { }

  //todo -  REGISTER

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto

      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.usersRepository.save(user)

      return {
        ...user,
        token: this.getJwtToken({ id: user.id}) // Retornar JWT
      }

    } catch (error) {
      this.handlerDbExceptions(error)
    }
  }


  //todo -  LOGIN

  async login(loginUserDto: LoginUserDto) {

      const { password, email } = loginUserDto

      const user = await this.usersRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true }// Datos a mostrar en la consulta
      })

      if (!user) {
        throw new UnauthorizedException('Invalid credentials')
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Invalid credentials')
      }

      return {
        ...user,
        token: this.getJwtToken({ id: user.id}) //Retornar JWT
      }
  }


  //todo -  CHECK AUTH STATUS

  async checkAuthStatus(user: User){

    return {
      ...user,
      token: this.getJwtToken({ id: user.id}) //Retornar JWT
    }
}


  //! -  MANEJO DE ERRORES

  private handlerDbExceptions(error: any) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }


  //! -  Generador de JWT Token

  private getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload)
    return token

  }


}
