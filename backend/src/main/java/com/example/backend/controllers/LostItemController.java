package com.example.backend.controllers;

import com.example.backend.dtos.LostItemRequestDto;
import com.example.backend.dtos.LostItemResponseDto;
import com.example.backend.dtos.UpdateItemDto;
import com.example.backend.services.LostItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class LostItemController {

    private final LostItemService lostItemService;

    @Autowired
    public LostItemController(LostItemService lostItemService) {
        this.lostItemService = lostItemService;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    /** Any authenticated user can report a lost/found item. */
    @PostMapping("/report-lost")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LostItemResponseDto> reportLostItem(
            @Valid @RequestBody LostItemRequestDto requestDto,
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(lostItemService.reportLostItem(requestDto, username));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    /** Public — anyone can browse the board. */
    @GetMapping("/all")
    public ResponseEntity<List<LostItemResponseDto>> getAllLostItems() {
        return ResponseEntity.ok(lostItemService.getAllLostItems());
    }

    /** Public — stats visible on home page. */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(lostItemService.getStats());
    }

    /** Public — get item by ID. */
    @GetMapping("/{itemId}")
    public ResponseEntity<LostItemResponseDto> getItemById(@PathVariable Long itemId) {
        return ResponseEntity.ok(lostItemService.getItemById(itemId));
    }

    /** Any authenticated user can view their own items. */
    @GetMapping("/user/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LostItemResponseDto>> getUserReportedItems(
            @PathVariable String username) {
        return ResponseEntity.ok(lostItemService.getReportedItemsByUser(username));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * PUT /api/items/{itemId}
     * Owner can edit their own LOST items (name, description, location, date).
     * Admin can edit any item at any status.
     */
    @PutMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LostItemResponseDto> updateItem(
            @PathVariable Long itemId,
            @RequestBody UpdateItemDto dto,
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(lostItemService.updateItem(itemId, dto, username));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/items/{itemId}
     * Owner can delete their own LOST items.
     * Admin can delete any item.
     */
    @DeleteMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> deleteItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal String username) {
        lostItemService.deleteItem(itemId, username);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Item deleted successfully");
        body.put("deletedId", itemId);
        return ResponseEntity.ok(body);
    }

    // ── Admin lifecycle actions ───────────────────────────────────────────────

    /** Admin only: LOST → FOUND */
    @PostMapping("/{itemId}/report-found")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LostItemResponseDto> reportFoundItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal String adminUsername) {
        return ResponseEntity.ok(lostItemService.reportFoundItem(itemId, adminUsername));
    }

    /** Admin only: FOUND → CLAIMED */
    @PostMapping("/{itemId}/claim")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LostItemResponseDto> claimItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal String adminUsername) {
        return ResponseEntity.ok(lostItemService.markAsClaimed(itemId, adminUsername));
    }

    /** Admin only: FOUND/CLAIMED → DISPATCHED */
    @PostMapping("/{itemId}/dispatch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LostItemResponseDto> dispatchItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal String adminUsername) {
        return ResponseEntity.ok(lostItemService.dispatchItem(itemId, adminUsername));
    }
}
