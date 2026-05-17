package com.interviewradar.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "post_rounds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostRound {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    private int roundNumber;
    private String roundName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String difficulty;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoundQuestion> questions;
}
