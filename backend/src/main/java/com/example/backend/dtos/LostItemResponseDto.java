package com.example.backend.dtos;

import com.example.backend.models.ItemStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LostItemResponseDto {
    private Long id;
    private String itemName;
    private String description;
    private String location;
    private LocalDate date;
    private ItemStatus status;
    private String reportedByUsername;
    private String foundByName;
    private boolean dispatch;
}
