package rentalhost.vn.web_rental.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "Authentication DTOs")
public class AuthDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Refresh token request body")
    public static class RefreshTokenRequest {
        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        @NotBlank
        private String refreshToken;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Authentication response with tokens")
    public static class AuthResponse {
        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        private String accessToken;

        @JsonIgnore
        @Getter(onMethod_ = @JsonIgnore)
        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        private String refreshToken;

        @Builder.Default
        @Schema(example = "Bearer")
        private String tokenType = "Bearer";

        @Schema(example = "900000")
        private long expiresIn;

        public AuthResponse(String accessToken, String refreshToken, long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenType = "Bearer";
            this.expiresIn = expiresIn;
        }
    }
}
