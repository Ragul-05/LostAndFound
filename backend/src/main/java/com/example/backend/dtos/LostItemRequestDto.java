package com.example.backend.dtos;

import java.time.LocalDate;
import lombok.Data;

@Data
public class LostItemRequestDto {
    private String itemName;
    private String description;
    private String location;
    private LocalDate date;
    /**
     * "lost" or "found" — determines initial ItemStatus
     */
    private String type;
}

