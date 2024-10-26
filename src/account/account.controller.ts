import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dto/create-account.dto';
import { GetAccountsDTO } from './dto/get-accounts.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/')
  async getAccounts(@Query() query: GetAccountsDTO) {
    return this.accountService.getAccounts(query);
  }

  @Get('/:id')
  async getAccount(@Param('id') id: number) {
    return this.accountService.getAccount(id);
  }

  @Post('/')
  async createAccount(@Body() dto: CreateAccountDTO) {
    return this.accountService.createAccount(dto);
  }

  @Patch('/:id')
  async updateAccount(@Param('id') id: number, @Body() dto: UpdateAccountDTO) {
    return this.accountService.updateAccount(id, dto);
  }

  @Delete('/:id')
  async deleteAccount(@Param('id') id: number) {
    await this.accountService.deleteAccount(id);
    return { status: 'Account deleted' };
  }
}
