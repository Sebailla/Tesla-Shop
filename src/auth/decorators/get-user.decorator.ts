import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new InternalServerErrorException('User not found in request');
        }

        // Si no se proporciona `data`, retorna al usuario completo.
        if (!data) {
            return user;
        }

        // Si el campo especificado por `data` no existe en el usuario, retorna null.
        return user[data] ?? null;
    }
);
