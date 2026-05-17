package com.interviewradar.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    private PostType type = PostType.InterviewExperience;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String role;
    private String location;
    private BigDecimal salaryPackage;
    private BigDecimal stipend;
    private String currency;

    @Column(name = "difficulty_level")
    private String difficulty;

    @Column(name = "interview_result")
    private String result;

    private boolean isAnonymous = false;
    private boolean isDraft = false;
    private int viewCount = 0;
    private double trendingScore = 0.0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostRound> rounds;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PostType {
        InterviewExperience, SalaryDiscussion, HiringUpdate, OAReport
    }

    public enum DifficultyLevel {
        Easy, Medium, Hard
    }

    public enum ResultStatus {
        Selected, Rejected, Waitlisted, Pending
    }
}
