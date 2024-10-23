import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { customAlphabet } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BastService {
  constructor(private prisma: PrismaService) {}

  generateBastNo(prefix: 'REQ' | 'RTN') {
    const year = format(new Date(), 'yy');
    const uniqueId = customAlphabet('1234567890ABCEDFGHIJKLMNOPQ', 5);
    return `${prefix}-${uniqueId()}-${year}`;
  }

  async getBastByBastNo(bastNo: string) {
    return this.prisma.bast.findFirstOrThrow({
      where: { bastNo },
      include: {
        admin: { include: { department: true } },
        hr: true,
        bastItems: { include: { asset: true } },
        assetRequests: {
          where: { bast: { bastNo } },
          include: { user: { include: { department: true } } },
        },
        assetReturned: {
          where: { bast: { bastNo } },
          include: { user: { include: { department: true } } },
        },
      },
    });
  }
}
