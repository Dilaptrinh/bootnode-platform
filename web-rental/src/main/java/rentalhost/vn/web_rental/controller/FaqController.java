package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.FaqDTO;
import rentalhost.vn.web_rental.enums.FaqCategory;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.FaqService;

import java.util.List;

@Tag(name = "FAQs", description = "Public FAQ content")
@RestController
@RequestMapping("/api/v1/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @Operation(summary = "Get active FAQs, optionally filtered by category")
    @GetMapping
    public ApiResponse<List<FaqDTO.FaqResponse>> getAll(@RequestParam(required = false) FaqCategory category) {
        return ApiResponse.success(faqService.getPublic(category));
    }
}
