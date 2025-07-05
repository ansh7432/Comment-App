import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { GetDeletedCommentsDto } from './dto/get-deleted-comments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get()
  async findAll(@Query() getCommentsDto: GetCommentsDto) {
    return this.commentsService.findAll(getCommentsDto);
  }

  @Get('deleted/history')
  async getDeletedComments(@Query() query: GetDeletedCommentsDto, @Request() req) {
    return this.commentsService.getDeletedComments(req.user.id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Get(':id/replies')
  async getReplies(@Param('id') id: string, @Query() getCommentsDto: GetCommentsDto) {
    return this.commentsService.getReplies(id, getCommentsDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Request() req) {
    return this.commentsService.delete(id, req.user.id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    return this.commentsService.restore(id, req.user.id);
  }
}
