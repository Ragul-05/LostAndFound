package com.example.backend.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateItemDto {
    private String itemName;
    private String description;
    private String location;
    private LocalDate date;
}
