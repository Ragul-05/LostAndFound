package com.example.backend.services;

import com.example.backend.dtos.LostItemRequestDto;
import com.example.backend.dtos.LostItemResponseDto;
import com.example.backend.dtos.UpdateItemDto;
import java.util.List;
import java.util.Map;

public interface LostItemService {
    LostItemResponseDto reportLostItem(LostItemRequestDto requestDto, String username);

    List<LostItemResponseDto> getAllLostItems();

    LostItemResponseDto getItemById(Long itemId);

    List<LostItemResponseDto> getReportedItemsByUser(String username);

    LostItemResponseDto updateItem(Long itemId, UpdateItemDto dto, String requestingUsername);

    void deleteItem(Long itemId, String requestingUsername);

    LostItemResponseDto reportFoundItem(Long itemId, String adminUsername);

    LostItemResponseDto markAsClaimed(Long itemId, String adminUsername);

    LostItemResponseDto dispatchItem(Long itemId, String adminUsername);

    Map<String, Long> getStats();
}
