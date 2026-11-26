package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.SiteSettingDTO;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.model.SiteSetting;
import rentalhost.vn.web_rental.repository.SiteSettingRepository;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    public static final Set<String> PUBLIC_KEYS = Set.of(
            "contact.email",
            "contact.phone",
            "contact.address",
            "contact.hours",
            "site.brand_name",
            "deploy.allowed_domain",
            "deploy.max_size_mb",
            "home.hero_title",
            "home.hero_subtitle"
    );

    private final SiteSettingRepository siteSettingRepository;

    @Cacheable(value = "siteSettings")
    @Transactional(readOnly = true)
    public Map<String, String> getPublicSettings() {
        Map<String, String> result = new LinkedHashMap<>();
        siteSettingRepository.findAllById(PUBLIC_KEYS).stream()
                .sorted(Comparator.comparing(SiteSetting::getSettingKey))
                .forEach(s -> result.put(s.getSettingKey(), s.getSettingValue()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<SiteSettingDTO.SettingItem> getAllSettings() {
        return siteSettingRepository.findAll().stream()
                .filter(s -> PUBLIC_KEYS.contains(s.getSettingKey()))
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
        if (!PUBLIC_KEYS.contains(key)) {
            throw new BadRequestException("Unknown setting key: " + key);
        }
        SiteSetting setting = siteSettingRepository.findById(key)
                .orElseGet(() -> SiteSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        siteSettingRepository.save(setting);
        return SiteSettingDTO.SettingItem.builder()
                .key(setting.getSettingKey())
                .value(setting.getSettingValue())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
