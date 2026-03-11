package com.example.backend.services;

import com.example.backend.dtos.LostItemRequestDto;
import com.example.backend.dtos.LostItemResponseDto;
import com.example.backend.dtos.UpdateItemDto;
import com.example.backend.exception.AccessDeniedException;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.models.ItemStatus;
import com.example.backend.models.LostItem;
import com.example.backend.models.Role;
import com.example.backend.models.User;
import com.example.backend.repositories.LostItemRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LostItemServiceImpl implements LostItemService {

    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;

    @Autowired
    public LostItemServiceImpl(LostItemRepository lostItemRepository, UserRepository userRepository) {
        this.lostItemRepository = lostItemRepository;
        this.userRepository = userRepository;
    }

    // ── Admin lookup (role already verified by Spring Security @PreAuthorize) ─
    private User getAdminUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // ── Public operations ────────────────────────────────────────────────────

    @Override
    public LostItemResponseDto reportLostItem(LostItemRequestDto requestDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        LostItem item = new LostItem();
        item.setItemName(requestDto.getItemName());
        item.setDescription(requestDto.getDescription());
        item.setLocation(requestDto.getLocation());
        item.setDate(requestDto.getDate());
        item.setReportedBy(user);

        // Default to LOST; if type=="found" treat as FOUND (admin posting found item)
        if ("found".equalsIgnoreCase(requestDto.getType())) {
            item.setStatus(ItemStatus.FOUND);
            item.setFoundByUser(user);
            item.setFoundByName(user.getUsername());
        } else {
            item.setStatus(ItemStatus.LOST);
        }

        LostItem savedItem = lostItemRepository.save(item);
        return mapToDto(savedItem);
    }

    @Override
    public List<LostItemResponseDto> getAllLostItems() {
        return lostItemRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LostItemResponseDto> getReportedItemsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return lostItemRepository.findByReportedById(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public LostItemResponseDto getItemById(Long itemId) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        return mapToDto(item);
    }

    @Override
    public LostItemResponseDto updateItem(Long itemId, UpdateItemDto dto, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requestingUsername));

        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        boolean isAdmin = requester.getRole() == Role.ADMIN;
        boolean isOwner = item.getReportedBy() != null &&
                          item.getReportedBy().getId().equals(requester.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You can only edit your own items");
        }

        // Users can only edit LOST items; admins can edit any status
        if (!isAdmin && item.getStatus() != ItemStatus.LOST) {
            throw new BadRequestException("Only LOST items can be edited. Current status: " + item.getStatus());
        }

        if (StringUtils.hasText(dto.getItemName()))   item.setItemName(dto.getItemName());
        if (StringUtils.hasText(dto.getDescription())) item.setDescription(dto.getDescription());
        if (StringUtils.hasText(dto.getLocation()))   item.setLocation(dto.getLocation());
        if (dto.getDate() != null)                     item.setDate(dto.getDate());

        return mapToDto(lostItemRepository.save(item));
    }

    @Override
    public void deleteItem(Long itemId, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requestingUsername));

        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        boolean isAdmin = requester.getRole() == Role.ADMIN;
        boolean isOwner = item.getReportedBy() != null &&
                          item.getReportedBy().getId().equals(requester.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You can only delete your own items");
        }

        // Users can only delete LOST items; admins can delete anything
        if (!isAdmin && item.getStatus() != ItemStatus.LOST) {
            throw new BadRequestException("Only LOST items can be deleted. Current status: " + item.getStatus());
        }

        lostItemRepository.deleteById(itemId);
    }

    @Override
    public LostItemResponseDto reportFoundItem(Long itemId, String adminUsername) {
        User admin = getAdminUser(adminUsername);

        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (item.getStatus() != ItemStatus.LOST) {
            throw new BadRequestException("Item is not currently LOST (status: " + item.getStatus() + ")");
        }

        item.setStatus(ItemStatus.FOUND);
        item.setFoundByUser(admin);
        item.setFoundByName(admin.getUsername());

        return mapToDto(lostItemRepository.save(item));
    }

    @Override
    public LostItemResponseDto markAsClaimed(Long itemId, String adminUsername) {
        getAdminUser(adminUsername);

        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (item.getStatus() != ItemStatus.FOUND) {
            throw new BadRequestException("Item must be FOUND before it can be CLAIMED (status: " + item.getStatus() + ")");
        }

        item.setStatus(ItemStatus.CLAIMED);
        return mapToDto(lostItemRepository.save(item));
    }

    @Override
    public LostItemResponseDto dispatchItem(Long itemId, String adminUsername) {
        getAdminUser(adminUsername);

        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (item.getStatus() != ItemStatus.FOUND && item.getStatus() != ItemStatus.CLAIMED) {
            throw new BadRequestException("Only FOUND or CLAIMED items can be dispatched (status: " + item.getStatus() + ")");
        }

        item.setStatus(ItemStatus.DISPATCHED);
        item.setDispatch(true);
        return mapToDto(lostItemRepository.save(item));
    }

    @Override
    public Map<String, Long> getStats() {
        List<LostItem> all = lostItemRepository.findAll();
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total", (long) all.size());
        stats.put("lost", all.stream().filter(i -> i.getStatus() == ItemStatus.LOST).count());
        stats.put("found", all.stream().filter(i -> i.getStatus() == ItemStatus.FOUND).count());
        stats.put("claimed", all.stream().filter(i -> i.getStatus() == ItemStatus.CLAIMED).count());
        stats.put("dispatched", all.stream().filter(i -> i.getStatus() == ItemStatus.DISPATCHED).count());
        return stats;
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private LostItemResponseDto mapToDto(LostItem item) {
        LostItemResponseDto dto = new LostItemResponseDto();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setLocation(item.getLocation());
        dto.setDate(item.getDate());
        dto.setStatus(item.getStatus());
        if (item.getReportedBy() != null) {
            dto.setReportedByUsername(item.getReportedBy().getUsername());
        }
        dto.setFoundByName(item.getFoundByName());
        dto.setDispatch(item.isDispatch());
        return dto;
    }
}
