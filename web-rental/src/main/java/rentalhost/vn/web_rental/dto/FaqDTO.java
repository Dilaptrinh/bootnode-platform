package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import rentalhost.vn.web_rental.enums.FaqCategory;

import java.time.LocalDateTime;

@Schema(description = "FAQ DTOs")
public class FaqDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create/update FAQ body")
    public static class FaqRequest {
        @Schema(example = "DEPLOY")
        @NotNull
        private FaqCategory category;

        @Schema(example = "Triển khai web tĩnh có mất phí không?")
        @NotBlank
        @Size(max = 500)
        private String question;

        @Schema(example = "Hoàn toàn miễn phí cho sinh viên Đại học Cần Thơ.")
        @NotBlank
        private String answer;

        @Schema(example = "1")
        private Integer displayOrder;

        @Schema(example = "true")
        private Boolean active;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "FAQ response")
    public static class FaqResponse {
        private Long id;
        private FaqCategory category;
        private String question;
        private String answer;
        private Integer displayOrder;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
