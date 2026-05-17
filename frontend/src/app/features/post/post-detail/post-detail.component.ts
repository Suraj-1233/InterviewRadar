import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { VoteService } from '../../../services/vote.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../models/post.model';
import { NavComponent } from '../../../components/nav/nav.component';
import { CommentThreadComponent } from '../../../shared/comment-thread/comment-thread.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavComponent, CommentThreadComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  commentService = inject(CommentService);
  voteService = inject(VoteService);
  auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  post = signal<Post | null>(null);
  loading = signal(true);
  newCommentContent = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(id).subscribe({
      next: (p) => {
        this.post.set(p);
        this.loading.set(false);
        this.commentService.fetchComments(id);
        if (this.auth.isLoggedIn()) this.voteService.loadVoteStatus(id);
      },
      error: () => { this.loading.set(false); }
    });
  }

  get voteStatus() {
    const p = this.post();
    return p
      ? this.voteService.getVote(p.id!)
      : { upvotes: 0, downvotes: 0, userVote: null };
  }

  vote(type: 'Upvote' | 'Downvote') {
    if (!this.auth.isLoggedIn()) {
      alert('Please sign in to vote');
      return;
    }
    const p = this.post();
    if (p) {
      this.voteService.toggleVote(p.id!, type);
    }
  }

  submitComment() {
    const p = this.post();
    if (!this.newCommentContent.trim() || !p?.id) return;
    this.commentService.addComment(p.id, { content: this.newCommentContent, anonymous: false }).subscribe({
      next: () => {
        this.newCommentContent = '';
      }
    });
  }

  onReply(event: { parentId: string; content: string; anonymous: boolean }) {
    const p = this.post();
    if (!p?.id) return;
    this.commentService.addComment(p.id, { content: event.content, parentId: event.parentId, anonymous: event.anonymous }).subscribe();
  }

  onLikeComment(commentId: string) {
    this.commentService.likeComment(commentId).subscribe();
  }

  deletePost() {
    const p = this.post();
    if (!p || !p.id) return;
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(p.id).subscribe({
        next: () => window.history.back(),
        error: () => alert('Failed to delete post.')
      });
    }
  }

  getSanitizedContent(content: string | undefined): SafeHtml {
    if (!content) return '';
    
    // URL matching regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // HTML Escape to completely prevent XSS
    let escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Parse URLs into high quality styled anchors matching YouTube theme
    const html = escaped.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; font-weight: 500; border-bottom: 1px solid transparent; transition: border-color var(--dur-fast);"} onmouseover="this.style.borderBottom='1px solid var(--accent)'" onmouseout="this.style.borderBottom='1px solid transparent'">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

