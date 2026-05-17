import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { VoteStatus } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private apiUrl = 'http://localhost:8080/api/votes';

  // Tracks vote state per post: Map<postId, VoteStatus>
  private _voteMap = signal<Record<string, VoteStatus>>({});
  voteMap = this._voteMap.asReadonly();

  constructor(private http: HttpClient) {}

  loadVoteStatus(postId: string): void {
    this.http.get<VoteStatus>(`${this.apiUrl}/post/${postId}`).subscribe(status => {
      this._voteMap.update(map => ({ ...map, [postId]: status }));
    });
  }

  toggleVote(postId: string, voteType: 'Upvote' | 'Downvote'): void {
    this.http.post<VoteStatus>(`${this.apiUrl}/post/${postId}`, { voteType }).pipe(
      tap(status => {
        this._voteMap.update(map => ({ ...map, [postId]: status }));
      })
    ).subscribe();
  }

  getVote(postId: string): VoteStatus {
    return this._voteMap()[postId] ?? { upvotes: 0, downvotes: 0, userVote: null };
  }
}
