package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.SiteSettingDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.SiteSettingService;

import java.util.List;

@Tag(name = "Admin Site Settings", description = "Admin manage site settings")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/site-settings")
@RequiredArgsConstructor
public class AdminSiteSettingController {

    private final SiteSettingService siteSettingService;

    @Operation(summary = "Get all public site settings")
    @GetMapping
    public ApiResponse<List<SiteSettingDTO.SettingItem>> getAll() {
        return ApiResponse.success(siteSettingService.getAllSettings());
    }

    @Operation(summary = "Upsert a site setting value")
    @PutMapping("/{key}")
    public ApiResponse<SiteSettingDTO.SettingItem> update(@PathVariable String key,
                                                          @Valid @RequestBody SiteSettingDTO.UpdateRequest request) {
        return ApiResponse.success(siteSettingService.upsert(key, request.getValue()));
    }
}
