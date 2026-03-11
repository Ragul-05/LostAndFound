package com.example.backend.repositories;

import com.example.backend.models.ItemStatus;
import com.example.backend.models.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByStatus(ItemStatus status);
    List<LostItem> findByReportedById(Long userId);
}
