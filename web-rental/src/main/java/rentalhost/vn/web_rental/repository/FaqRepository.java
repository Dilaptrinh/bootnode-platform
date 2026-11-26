package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rentalhost.vn.web_rental.enums.FaqCategory;
import rentalhost.vn.web_rental.model.Faq;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByActiveTrueOrderByDisplayOrderAsc();

    List<Faq> findByCategoryAndActiveTrueOrderByDisplayOrderAsc(FaqCategory category);
}
