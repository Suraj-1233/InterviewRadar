package com.interviewradar.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "round_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoundQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id")
    private PostRound round;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @ElementCollection
    private List<String> topicTags;
}
