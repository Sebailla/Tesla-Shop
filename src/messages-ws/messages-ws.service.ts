import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


interface ConnectedClients {
    [id: string]: {
        soket: Socket,
        user: User,
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }


    async registerCliente(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) throw new Error('User not found')
        if (!user.isActive) throw new Error('User not active')

        this.checkUserConnection(user)

        this.connectedClients[client.id] = {
            soket: client,
            user: user,
        }
    }

    removeCliente(clientId: string) {
        delete this.connectedClients[clientId]
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients)
    }

    getUserFullName(socketId: string) {
        const name = this.connectedClients[socketId].user.name
        const lastName = this.connectedClients[socketId].user.lastName
        return `${name} ${lastName}`
    }

    private checkUserConnection(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId]
            if (connectedClient.user.id === user.id) {
                connectedClient.soket.disconnect()
                break
            }
        }
    }
}
