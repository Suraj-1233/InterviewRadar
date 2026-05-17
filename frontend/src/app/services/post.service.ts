import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { Post, PostFilter } from '../models/post.model';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  // ── State (following LLD Signals pattern) ─────────────────────────────────
  private _posts   = signal<Post[]>([]);
  private _loading = signal(false);
  private _hasMore = signal(true);
  private _error   = signal<string | null>(null);

  // ── Public read-only ───────────────────────────────────────────────────────
  posts   = this._posts.asReadonly();
  loading = this._loading.asReadonly();
  hasMore = this._hasMore.asReadonly();
  error   = this._error.asReadonly();

  constructor(private http: HttpClient) {}

  fetchPosts(filter: PostFilter = {}, append = false): void {
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 10)
      .set('sort', filter.sort ?? 'latest');

    if (filter.company)    params = params.set('company', filter.company);
    if (filter.tag)        params = params.set('tag', filter.tag);
    if (filter.difficulty) params = params.set('difficulty', filter.difficulty);

    this.http.get<PageResponse<Post>>(this.apiUrl, { params }).subscribe({
      next: (page) => {
        if (append) {
          this._posts.update(current => [...current, ...page.content]);
        } else {
          this._posts.set(page.content);
        }
        this._hasMore.set(!page.last);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load posts');
        this._loading.set(false);
      }
    });
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post).pipe(
      tap(newPost => {
        // Optimistic update — new post at top of feed
        this._posts.update(current => [newPost, ...current]);
      })
    );
  }

  updatePost(id: string, post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._posts.update(current => current.filter(p => p.id !== id));
      })
    );
  }

  getDrafts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/drafts`);
  }

  getById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }
}
