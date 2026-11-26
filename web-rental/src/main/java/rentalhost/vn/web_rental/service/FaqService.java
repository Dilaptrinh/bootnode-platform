package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.FaqDTO;
import rentalhost.vn.web_rental.enums.FaqCategory;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.FaqMapper;
import rentalhost.vn.web_rental.model.Faq;
import rentalhost.vn.web_rental.repository.FaqRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqMapper faqMapper;

    @Cacheable(value = "faqs", key = "#category == null ? 'ALL' : #category.name()")
    @Transactional(readOnly = true)
    public List<FaqDTO.FaqResponse> getPublic(FaqCategory category) {
        List<Faq> faqs = category == null
                ? faqRepository.findByActiveTrueOrderByDisplayOrderAsc()
                : faqRepository.findByCategoryAndActiveTrueOrderByDisplayOrderAsc(category);
        return faqs.stream()
                .map(faqMapper::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional(readOnly = true)
    public Page<FaqDTO.FaqResponse> getAll(Pageable pageable) {
        return faqRepository.findAll(pageable)
                .map(faqMapper::toResponse);
    }

    @Transactional
    @CacheEvict(cacheNames = "faqs", allEntries = true)
    public FaqDTO.FaqResponse create(FaqDTO.FaqRequest request) {
        Faq faq = Faq.builder()
                .category(request.getCategory())
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        return faqMapper.toResponse(faqRepository.save(faq));
    }

    @Transactional
    @CacheEvict(cacheNames = "faqs", allEntries = true)
    public FaqDTO.FaqResponse update(Long id, FaqDTO.FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", id));
        faq.setCategory(request.getCategory());
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        if (request.getDisplayOrder() != null) faq.setDisplayOrder(request.getDisplayOrder());
        if (request.getActive() != null) faq.setActive(request.getActive());
        return faqMapper.toResponse(faqRepository.save(faq));
    }

    @Transactional
    @CacheEvict(cacheNames = "faqs", allEntries = true)
    public void delete(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new ResourceNotFoundException("FAQ", id);
        }
        faqRepository.deleteById(id);
    }
}
