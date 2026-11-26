package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.AuthDTO;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.enums.UserStatus;
import rentalhost.vn.web_rental.exception.UnauthorizedException;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.UserRepository;
import rentalhost.vn.web_rental.security.JwtConfig;
import rentalhost.vn.web_rental.security.JwtTokenProvider;
import rentalhost.vn.web_rental.security.RefreshTokenStore;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final RefreshTokenStore refreshTokenStore;

    @Value("${app.auth.admin-emails:}")
    private String adminEmails;

    @Transactional
    public AuthDTO.AuthResponse refresh(AuthDTO.RefreshTokenRequest request) {
        return refreshToken(request.getRefreshToken());
    }

    @Transactional
    public AuthDTO.AuthResponse refreshToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        Long userId = refreshTokenStore.findUserId(token);

        if (userId == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        refreshTokenStore.delete(token, userId);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTO.AuthResponse processOAuthUser(String email, String name, String avatar, String googleId) {
        User user = userRepository.findByGoogleId(googleId).orElse(null);
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = User.builder()
                        .email(email)
                        .fullName(name)
                        .avatar(avatar)
                        .googleId(googleId)
                        .role(isAdminEmail(email) ? UserRole.SUPER_ADMIN : UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .build();
            } else {
                user.setGoogleId(googleId);
                if (avatar != null) {
                    user.setAvatar(avatar);
                }
            }
        }
        if (isAdminEmail(user.getEmail()) && user.getRole() != UserRole.SUPER_ADMIN) {
            user.setRole(UserRole.SUPER_ADMIN);
        }
        return generateAuthResponse(userRepository.save(user));
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenStore.deleteAllByUserId(userId);
    }

    private boolean isAdminEmail(String email) {
        if (email == null || adminEmails == null || adminEmails.isBlank()) {
            return false;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return adminEmailList().stream().anyMatch(normalized::equals);
    }

    private List<String> adminEmailList() {
        return Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .toList();
    }

    private AuthDTO.AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        refreshTokenStore.save(refreshToken, user.getId(), jwtConfig.getRefreshExpiration());

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtConfig.getAccessExpiration())
                .build();
    }
}
