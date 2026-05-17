import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Comment, CreateCommentRequest } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';

  // ── State ──────────────────────────────────────────────────────────────────
  private _comments = signal<Comment[]>([]);
  private _loading  = signal(false);

  comments = this._comments.asReadonly();
  loading  = this._loading.asReadonly();
  
  likedCommentIds = new Set<string>();

  constructor(private http: HttpClient) {}

  fetchComments(postId: string): void {
    this._loading.set(true);
    this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).subscribe({
      next: (tree) => {
        this._comments.set(tree);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  addComment(postId: string, req: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}`, req).pipe(
      tap(newComment => {
        if (!newComment.parentId) {
          // Root comment → add to top-level
          this._comments.update(current => [...current, newComment]);
        } else {
          // Reply → add inside parent's replies array (recursive helper)
          this._comments.update(current => this.addReply(current, newComment));
        }
      })
    );
  }

  likeComment(commentId: string): Observable<{ likeCount: number } | null> {
    if (this.likedCommentIds.has(commentId)) {
      return new Observable(sub => { sub.next(null); sub.complete(); });
    }
    
    this.likedCommentIds.add(commentId);
    
    // Optimistic UI Update
    this._comments.update(current => this.updateLikeCount(current, commentId, 1));
    
    return this.http.post<{ likeCount: number }>(`${this.apiUrl}/${commentId}/like`, {}).pipe(
      tap(res => {
        this._comments.update(current => this.setLikeCount(current, commentId, res.likeCount));
      })
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`).pipe(
      tap(() => {
        this._comments.update(current => this.removeComment(current, commentId));
      })
    );
  }

  // ── Helpers for nested tree updates ───────────────────────────────────────

  private addReply(comments: Comment[], newReply: Comment): Comment[] {
    return comments.map(c => {
      if (c.id === newReply.parentId) {
        return { ...c, replies: [...c.replies, newReply] };
      }
      if (c.replies.length > 0) {
        return { ...c, replies: this.addReply(c.replies, newReply) };
      }
      return c;
    });
  }

  private removeComment(comments: Comment[], id: string): Comment[] {
    return comments
      .filter(c => c.id !== id)
      .map(c => ({ ...c, replies: this.removeComment(c.replies, id) }));
  }

  private updateLikeCount(comments: Comment[], id: string, delta: number): Comment[] {
    return comments.map(c => {
      if (c.id === id) {
        return { ...c, likeCount: c.likeCount + delta };
      }
      if (c.replies.length > 0) {
        return { ...c, replies: this.updateLikeCount(c.replies, id, delta) };
      }
      return c;
    });
  }

  private setLikeCount(comments: Comment[], id: string, count: number): Comment[] {
    return comments.map(c => {
      if (c.id === id) {
        return { ...c, likeCount: count };
      }
      if (c.replies.length > 0) {
        return { ...c, replies: this.setLikeCount(c.replies, id, count) };
      }
      return c;
    });
  }
}
