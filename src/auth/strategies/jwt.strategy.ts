import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from '../entities/user.entity';
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret', // Valor predeterminado
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id } = payload;

        // Buscamos al usuario por email
        const user = await this.userRepository.findOne({
            where: { id },
        });

        // Validamos si el usuario existe
        if (!user) {
            throw new UnauthorizedException('Token not valid');
        }

        // Validamos si el usuario está activo
        if (!user.isActive) {
            throw new UnauthorizedException('User is not active');
        }

        return user; // Retornamos el usuario validado
    }
}


