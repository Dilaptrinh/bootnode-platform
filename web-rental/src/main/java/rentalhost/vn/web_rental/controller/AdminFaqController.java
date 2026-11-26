package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.FaqDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.FaqService;

@Tag(name = "Admin FAQs", description = "Admin manage FAQ content")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/faqs")
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqService faqService;

    @Operation(summary = "Get all FAQs (paginated)")
    @GetMapping
    public ApiResponse<Page<FaqDTO.FaqResponse>> getAll(
            @PageableDefault(size = 10, sort = "displayOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(faqService.getAll(pageable));
    }

    @Operation(summary = "Create a FAQ")
    @PostMapping
    public ApiResponse<FaqDTO.FaqResponse> create(@Valid @RequestBody FaqDTO.FaqRequest request) {
        return ApiResponse.created(faqService.create(request));
    }

    @Operation(summary = "Update a FAQ")
    @PutMapping("/{id}")
    public ApiResponse<FaqDTO.FaqResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody FaqDTO.FaqRequest request) {
        return ApiResponse.success(faqService.update(id, request));
    }

    @Operation(summary = "Delete a FAQ")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        faqService.delete(id);
        return ApiResponse.noContent();
    }
}
