package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.mapper.ServerMapper;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dữ liệu catalogue công khai được cache bằng Redis (tăng tốc trang hosting).
 * Tách bean riêng để @Cacheable hoạt động qua proxy (tránh self-invocation)
 * và tránh cache đối tượng Page (khó serialize).
 */
@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private final ServerRepository serverRepository;
    private final OrderRepository orderRepository;
    private final ServerMapper serverMapper;

    @Cacheable(value = "servers", sync = true)
    public List<ServerDTO.ServerResponse> availableServers() {
        // A plan marked RENTED may still have free slots (quantity > active orders), so include
        // both AVAILABLE and RENTED; only MAINTENANCE is hidden. Then drop plans with no slots left.
        List<Server> servers = serverRepository.findByStatusIn(
                List.of(ServerStatus.AVAILABLE, ServerStatus.RENTED));
        Map<Long, Long> activeByServer = activeCountByServer();
        return servers.stream()
                // Gói bị admin ẩn (visible=false) không xuất hiện trên trang bán.
                // null được coi là hiển thị để tương thích dữ liệu cũ.
                .filter(server -> !Boolean.FALSE.equals(server.getVisible()))
                .map(server -> toResponse(server, activeByServer))
                .filter(resp -> resp.getQuantity() == null
                        || (resp.getRemaining() != null && resp.getRemaining() > 0))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private Map<Long, Long> activeCountByServer() {
        // PENDING orders also reserve a slot (see OrderService.create), so count them too.
        return orderRepository.countByServerGroupByStatusIn(
                        List.of(OrderStatus.PENDING, OrderStatus.ACTIVE)).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()));
    }

    private ServerDTO.ServerResponse toResponse(Server server, Map<Long, Long> activeByServer) {
        ServerDTO.ServerResponse resp = serverMapper.toResponse(server);
        if (server.getQuantity() != null) {
            long active = activeByServer.getOrDefault(server.getId(), 0L);
            long remaining = Math.max(0, server.getQuantity().longValue() - active);
            resp.setRemaining(remaining);
            // Keep public status consistent with actual availability.
            resp.setStatus(remaining > 0 ? ServerStatus.AVAILABLE.name() : ServerStatus.RENTED.name());
        }
        return resp;
    }
}
