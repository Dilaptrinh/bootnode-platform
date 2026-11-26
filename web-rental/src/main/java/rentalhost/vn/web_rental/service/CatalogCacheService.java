package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

/**
 * Purges the edge (Cloudflare) cache for the public hosting catalogue after a
 * transaction commits, so "còn chỗ" reflects new/cancelled/paid orders.
 */
@Service
@RequiredArgsConstructor
public class CatalogCacheService {

    private final CloudflareCacheService cloudflareCacheService;

    @Value("${APP_BASE_URL:https://bootnode.cloud}")
    private String baseUrl;

    public void purgeEdgeCacheAfterCommit() {
        Runnable purge = () -> cloudflareCacheService.purgeCache(List.of(baseUrl + "/api/v1/servers"));
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    purge.run();
                }
            });
        } else {
            purge.run();
        }
    }
}
