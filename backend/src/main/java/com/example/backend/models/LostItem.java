package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "lost_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "date_lost", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;

    // Optional: Only filled if someone finds it before an admin posts
    // For admin posting found items, they might be the founder or they can specify a name string
    @Column(name = "found_by_name")
    private String foundByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "found_by_user_id")
    private User foundByUser;

    @Column(name = "is_dispatched")
    private boolean dispatch = false;
}
