package rentalhost.vn.web_rental.model;

import jakarta.persistence.*;
import lombok.*;
import rentalhost.vn.web_rental.enums.ServerStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ServerCategory category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String cpu;

    @Column(nullable = false, length = 50)
    private String ram;

    @Column(nullable = false, length = 50)
    private String storage;

    @Column(nullable = false, length = 50)
    private String bandwidth;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity")
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServerStatus status;

    /**
     * Cho phép admin ẩn gói khỏi trang bán (không hiển thị, không cho đặt mua)
     * mà không cần xóa hay đổi trạng thái vận hành. null được coi là hiển thị.
     */
    @Column(name = "visible")
    @Builder.Default
    private Boolean visible = Boolean.TRUE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "server", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
