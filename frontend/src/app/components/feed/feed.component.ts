import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold font-outfit">Community Feed</h2>
        <div class="flex gap-2">
          <button class="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-600 transition-colors">Latest</button>
          <button class="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-600 transition-colors">Trending</button>
        </div>
      </div>

      <div *ngIf="postService.loading()">
        <div class="animate-pulse space-y-4">
          <div class="h-40 bg-slate-800 rounded-xl"></div>
          <div class="h-40 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
      <div *ngIf="!postService.loading()">
        <div *ngFor="let post of postService.posts()" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <img [src]="post.companyLogo || 'https://ui-avatars.com/api/?name=' + post.authorName" alt="Logo">
              </div>
              <div>
                <h3 class="font-semibold text-lg group-hover:text-indigo-400 transition-colors">{{post.title}}</h3>
                <p class="text-slate-400 text-sm">
                  by <span [class.italic]="post.anonymous">{{post.authorName}}</span> • {{post.createdAt | date:'mediumDate'}}
                </p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium" 
                  [ngClass]="{
                    'bg-green-500/10 text-green-400': post.result === 'Selected',
                    'bg-red-500/10 text-red-400': post.result === 'Rejected',
                    'bg-amber-500/10 text-amber-400': post.result === 'Pending'
                  }">
              {{post.result}}
            </span>
          </div>
          
          <p class="text-slate-300 line-clamp-3 mb-4">{{post.content}}</p>
          
          <div class="flex items-center gap-4 text-sm text-slate-400">
            <span class="flex items-center gap-1">🏢 {{post.companyName}}</span>
            <span class="flex items-center gap-1">💼 {{post.role}}</span>
            <span class="flex items-center gap-1">📊 {{post.difficulty}}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeedComponent implements OnInit {
  postService = inject(PostService);

  ngOnInit() {
    this.postService.fetchPosts();
  }
}
