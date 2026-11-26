package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.config.DeployAccessConfig;
import rentalhost.vn.web_rental.config.SiteStorageConfig;
import rentalhost.vn.web_rental.dto.SiteSettingDTO;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.model.SiteSetting;
import rentalhost.vn.web_rental.repository.SiteSettingRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    public static final String KEY_DEPLOY_ALLOWED_DOMAIN = "deploy.allowed_domain";
    public static final String KEY_DEPLOY_MAX_SIZE_MB = "deploy.max_size_mb";

    /** Keys safe to expose on the public GET endpoint. */
    public static final Set<String> PUBLIC_KEYS = Set.of(
            "contact.email",
            "contact.phone",
            "contact.address",
            "contact.hours",
            "site.brand_name",
            "home.hero_title",
            "home.hero_subtitle"
    );

    /** Keys admins are allowed to read/write (superset of public keys). */
    public static final Set<String> EDITABLE_KEYS = Set.of(
            "contact.email",
            "contact.phone",
            "contact.address",
            "contact.hours",
            "site.brand_name",
            "home.hero_title",
            "home.hero_subtitle",
            KEY_DEPLOY_ALLOWED_DOMAIN,
            KEY_DEPLOY_MAX_SIZE_MB
    );

    private final SiteSettingRepository siteSettingRepository;
    private final SiteStorageConfig siteStorageConfig;
    private final DeployAccessConfig deployAccessConfig;

    @Cacheable(value = "siteSettings")
    @Transactional(readOnly = true)
    public Map<String, String> getPublicSettings() {
        Map<String, String> result = new LinkedHashMap<>();
        siteSettingRepository.findAllById(PUBLIC_KEYS).stream()
                // Bỏ qua giá trị rỗng: admin xóa thông tin trong Settings thì API
                // công khai không trả về nữa (tránh lộ email/số điện thoại).
                .filter(s -> s.getSettingValue() != null && !s.getSettingValue().isBlank())
                .sorted(Comparator.comparing(SiteSetting::getSettingKey))
                .forEach(s -> result.put(s.getSettingKey(), s.getSettingValue()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<SiteSettingDTO.SettingItem> getAllSettings() {
        Map<String, SiteSetting> stored = new LinkedHashMap<>();
        siteSettingRepository.findAll().stream()
                .filter(s -> EDITABLE_KEYS.contains(s.getSettingKey()))
                .forEach(s -> stored.put(s.getSettingKey(), s));

        // Surface the effective deploy defaults so admins can see/edit current values.
        stored.putIfAbsent(KEY_DEPLOY_MAX_SIZE_MB, SiteSetting.builder()
                .settingKey(KEY_DEPLOY_MAX_SIZE_MB)
                .settingValue(String.valueOf(siteStorageConfig.getMaxSizeBytes() / (1024 * 1024)))
                .build());
        stored.putIfAbsent(KEY_DEPLOY_ALLOWED_DOMAIN, SiteSetting.builder()
                .settingKey(KEY_DEPLOY_ALLOWED_DOMAIN)
                .settingValue(String.join(",", deployAccessConfig.getAllowedEmailDomains()))
                .build());

        return stored.values().stream()
                .sorted(Comparator.comparing(SiteSetting::getSettingKey))
                .map(s -> SiteSettingDTO.SettingItem.builder()
                        .key(s.getSettingKey())
                        .value(s.getSettingValue())
                        .updatedAt(s.getUpdatedAt())
                        .build())
                .toList();
    }

    @Transactional
    @CacheEvict(cacheNames = "siteSettings", allEntries = true)
    public SiteSettingDTO.SettingItem upsert(String key, String value) {
        if (!EDITABLE_KEYS.contains(key)) {
            throw new BadRequestException("Unknown setting key: " + key);
        }
        String normalized = normalize(key, value);
        SiteSetting setting = siteSettingRepository.findById(key)
                .orElseGet(() -> SiteSetting.builder().settingKey(key).build());
        setting.setSettingValue(normalized);
        siteSettingRepository.save(setting);
        return SiteSettingDTO.SettingItem.builder()
                .key(setting.getSettingKey())
                .value(setting.getSettingValue())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }

    /**
     * Effective max upload size for static deployments, read from site settings
     * and falling back to the {@code site.max-size-bytes} configuration.
     */
    @Transactional(readOnly = true)
    public long getMaxDeploySizeBytes() {
        return siteSettingRepository.findById(KEY_DEPLOY_MAX_SIZE_MB)
                .map(SiteSetting::getSettingValue)
                .flatMap(SiteSettingService::parsePositiveLong)
                .map(mb -> mb * 1024L * 1024L)
                .orElseGet(siteStorageConfig::getMaxSizeBytes);
    }

    /**
     * Effective list of email domains allowed to deploy, read from site settings
     * and falling back to the {@code app.deploy.allowed-email-domains} configuration.
     */
    @Transactional(readOnly = true)
    public List<String> getDeployAllowedDomains() {
        return siteSettingRepository.findById(KEY_DEPLOY_ALLOWED_DOMAIN)
                .map(SiteSetting::getSettingValue)
                .map(SiteSettingService::splitDomains)
                .filter(list -> !list.isEmpty())
                .orElseGet(deployAccessConfig::getAllowedEmailDomains);
    }

    private String normalize(String key, String value) {
        String trimmed = value == null ? "" : value.trim();
        if (KEY_DEPLOY_MAX_SIZE_MB.equals(key)) {
            Long mb = parsePositiveLong(trimmed).orElseThrow(
                    () -> new BadRequestException("deploy.max_size_mb phải là số nguyên dương (MB)"));
            if (mb > 102400L) {
                throw new BadRequestException("deploy.max_size_mb quá lớn (tối đa 102400 MB)");
            }
            return String.valueOf(mb);
        }
        if (KEY_DEPLOY_ALLOWED_DOMAIN.equals(key)) {
            List<String> domains = splitDomains(trimmed);
            if (domains.isEmpty()) {
                throw new BadRequestException("deploy.allowed_domain không được để trống");
            }
            return String.join(",", domains);
        }
        return trimmed;
    }

    private static Optional<Long> parsePositiveLong(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        try {
            long value = Long.parseLong(raw.trim());
            return value > 0 ? Optional.of(value) : Optional.empty();
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    private static List<String> splitDomains(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        List<String> domains = new ArrayList<>();
        for (String part : Arrays.asList(raw.split(","))) {
            String domain = part.trim().toLowerCase()
                    .replaceFirst("^@", "")
                    .replaceFirst("^\\.", "");
            if (!domain.isEmpty()) {
                domains.add(domain);
            }
        }
        return domains;
    }
}
