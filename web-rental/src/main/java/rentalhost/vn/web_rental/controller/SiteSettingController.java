package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.SiteSettingService;

import java.util.Map;

@Tag(name = "Site Settings", description = "Public site settings")
@RestController
@RequestMapping("/api/v1/site-settings")
@RequiredArgsConstructor
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    @Operation(summary = "Get public site settings")
    @GetMapping
    public ApiResponse<Map<String, String>> getPublicSettings() {
        return ApiResponse.success(siteSettingService.getPublicSettings());
    }
}
