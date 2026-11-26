package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rentalhost.vn.web_rental.model.SiteSetting;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, String> {
}
