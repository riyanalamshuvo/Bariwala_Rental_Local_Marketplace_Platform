import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private svc: MessagesService) {}

  @Post()
  send(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.svc.send(req.user.id, dto);
  }

  @Get('conversations')
  conversations(@Request() req: any) {
    return this.svc.getConversations(req.user.id);
  }

  @Get('thread/:partnerId')
  thread(@Request() req: any, @Param('partnerId') partnerId: string) {
    return this.svc.getThread(req.user.id, partnerId);
  }

  @Get('unread')
  unread(@Request() req: any) {
    return this.svc.getUnreadCount(req.user.id);
  }
}
