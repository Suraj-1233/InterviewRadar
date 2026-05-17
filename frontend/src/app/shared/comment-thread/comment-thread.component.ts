import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-thread.component.html',
  styleUrl: './comment-thread.component.css'
})
export class CommentThreadComponent {
  @Input() comments: Comment[] = [];
  @Output() reply = new EventEmitter<{ parentId: string; content: string; anonymous: boolean }>();
  @Output() like  = new EventEmitter<string>();

  commentService = inject(CommentService);

  replyingTo    = '';
  replyContent  = '';

  startReply(comment: Comment) {
    this.replyingTo   = comment.id;
    this.replyContent = '';
  }

  cancelReply() {
    this.replyingTo  = '';
    this.replyContent = '';
  }

  submitReply(parentId: string) {
    if (!this.replyContent.trim()) return;
    this.reply.emit({ parentId, content: this.replyContent.trim(), anonymous: false });
    this.cancelReply();
  }

  onLike(commentId: string) {
    if (this.commentService.likedCommentIds.has(commentId)) return;
    this.like.emit(commentId);
  }
}
