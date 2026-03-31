import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private msgRepo: Repository<Message>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async send(senderId: string, dto: SendMessageDto) {
    const msg = this.msgRepo.create({
      senderId,
      receiverId: dto.receiverId,
      propertyId: dto.propertyId,
      content: dto.content,
    });
    return this.msgRepo.save(msg);
  }

  async getConversations(userId: string) {
    // Get all messages involving this user, ordered by newest first
    const messages = await this.msgRepo
      .createQueryBuilder('m')
      .where('m.sender_id = :uid OR m.receiver_id = :uid', { uid: userId })
      .orderBy('m.created_at', 'DESC')
      .getMany();

    // Group by partner and keep only the latest message per partner
    const partnerMap = new Map<string, any>();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          isRead: msg.senderId === userId ? true : msg.isRead,
        });
      }
    }

    // Fetch partner user details
    const conversations: any[] = [];
    for (const [partnerId, conv] of partnerMap) {
      const partner = await this.userRepo.findOne({
        where: { id: partnerId },
        select: ['id', 'fullName', 'email', 'role'],
      });
      conversations.push({
        ...conv,
        partner: partner || { id: partnerId, fullName: 'Unknown User', email: '', role: '' },
      });
    }

    return conversations;
  }

  async getThread(userId: string, partnerId: string) {
    const messages = await this.msgRepo.find({
      where: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });

    // Mark unread messages as read
    await this.msgRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('sender_id = :partnerId AND receiver_id = :userId AND is_read = false', {
        partnerId,
        userId,
      })
      .execute();

    return messages;
  }

  async getUnreadCount(userId: string) {
    const count = await this.msgRepo.count({
      where: { receiverId: userId, isRead: false },
    });
    return { unreadCount: count };
  }
}
