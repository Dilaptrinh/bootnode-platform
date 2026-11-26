package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Schema(description = "Site settings DTOs")
public class SiteSettingDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Update a setting value")
    public static class UpdateRequest {
        @Schema(example = "support@bootnode.cloud")
        @NotBlank
        @Size(max = 2000)
        private String value;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Setting item")
    public static class SettingItem {
        private String key;
        private String value;
        private LocalDateTime updatedAt;
    }
}
