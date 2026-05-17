import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../../components/nav/nav.component';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  auth        = inject(AuthService);
  postService = inject(PostService);

  activeTab = 'posts';
  myPosts: Post[] = [];

  tabs = [
    { label: 'My Posts',  value: 'posts'    },
    { label: 'Activity',  value: 'activity'  },
  ];

  profileStats = [
    { value: '—', label: 'Posts'     },
    { value: '—', label: 'Views'     },
    { value: '—', label: 'Upvotes'   },
    { value: '—', label: 'Comments'  },
  ];

  recentActivity = [
    { icon: 'Post', text: 'Posted "Google SDE-1 Interview Experience"',   time: '2 days ago' },
    { icon: 'Vote', text: 'Upvoted "Amazon System Design Round"',          time: '3 days ago' },
    { icon: 'Comment', text: 'Commented on "Flipkart Backend Interview"',    time: '5 days ago' },
    { icon: 'Join', text: 'Joined InterviewRadar',                         time: '1 week ago' },
  ];

  ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    // Load user's posts (all posts filtered client-side by authorName)
    this.postService.fetchPosts({ page: 0, size: 50, sort: 'latest' });
    setTimeout(() => {
      const username = this.auth.currentUser()?.username;
      this.myPosts = this.postService.posts().filter(p =>
        !p.anonymous && p.authorName === username
      );
      this.profileStats[0].value = String(this.myPosts.length);
    }, 1000);
  }

  editProfile() {
    const user = this.auth.currentUser();
    if (!user) return;
    const newName = window.prompt('Enter your full name:', user.fullName || user.username);
    if (newName !== null && newName.trim() !== '') {
      this.auth.updateProfile({ fullName: newName.trim() }).subscribe();
    }
  }
}
