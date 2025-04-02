import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtServices: JwtService
  ) { }

  async handleConnection(client: Socket){

    const token = client.handshake.headers.authentication as string
    let payload: JwtPayload

    try {
      payload = this.jwtServices.verify(token)
      await this.messagesWsService.registerCliente(client, payload.id);
      
    } catch (error) {
      client.disconnect()
      return
    }

    //console.log({payload})

    //let counter = this.messagesWsService.getConnectedClients()
    //console.log(`Conected Clients: ${counter}`)

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {

    this.messagesWsService.removeCliente(client.id);

    //let counter = this.messagesWsService.getConnectedClients()
    //console.log(`Conected Clients: ${counter}`)

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  // message-from-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
    //! Emite unicamente al cliente (unico)
    /* client.emit('message-from-server', {
      fullName: 'Soy Yo!',
      message: payload.message || 'no-message'
    }) */

    //! Emite a todos MENOS, al cliente inicial
    /* client.broadcast.emit('message-from-server', {
      fullName: 'Soy Yo!',
      message: payload.message || 'no-message'
    }) */

    //! Emite a todos los clientes
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    })

    //! Mensaje en salas
  }
}
