package rentalhost.vn.web_rental.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.model.Server;

import java.util.List;
import java.util.Optional;

public interface ServerRepository extends JpaRepository<Server, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Server s WHERE s.id = :id")
    Optional<Server> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.status = :status")
    List<Server> findByStatus(ServerStatus status);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.status IN :statuses")
    List<Server> findByStatusIn(@Param("statuses") java.util.Collection<ServerStatus> statuses);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.status = :status")
    Page<Server> findByStatus(ServerStatus status, Pageable pageable);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category")
    Page<Server> findAllWithCategory(Pageable pageable);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.category.id = :categoryId")
    List<Server> findByCategoryId(Long categoryId);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.category.id = :categoryId AND s.status = :status")
    List<Server> findByCategoryIdAndStatus(Long categoryId, ServerStatus status);
}
