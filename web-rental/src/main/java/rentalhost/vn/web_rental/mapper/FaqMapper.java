package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import rentalhost.vn.web_rental.dto.FaqDTO;
import rentalhost.vn.web_rental.model.Faq;

@Mapper(componentModel = "spring")
public interface FaqMapper {

    FaqDTO.FaqResponse toResponse(Faq faq);
}
