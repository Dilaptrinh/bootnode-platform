CREATE TABLE IF NOT EXISTS announcements (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)    NOT NULL,
    content     TEXT            NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_announcements PRIMARY KEY (id),
    INDEX idx_announcements_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sites (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    subdomain       VARCHAR(40)     NOT NULL,
    source          ENUM('FOLDER','GITHUB') NOT NULL,
    github_url      VARCHAR(500)    DEFAULT NULL,
    status          ENUM('DEPLOYING','ACTIVE','FAILED') NOT NULL,
    url             VARCHAR(500)    DEFAULT NULL,
    error_message   VARCHAR(255)    DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_sites PRIMARY KEY (id),
    CONSTRAINT uq_sites_subdomain UNIQUE (subdomain),
    CONSTRAINT fk_sites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sites_user (user_id),
    INDEX idx_sites_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    category        ENUM('HOSTING','DEPLOY','GENERAL') NOT NULL,
    question        VARCHAR(500)    NOT NULL,
    answer          TEXT            NOT NULL,
    display_order   INT             NOT NULL DEFAULT 0,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_faqs PRIMARY KEY (id),
    INDEX idx_faqs_category (category),
    INDEX idx_faqs_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key     VARCHAR(100)    NOT NULL,
    setting_value   TEXT            DEFAULT NULL,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_site_settings PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id') = 0,
    'ALTER TABLE users ADD COLUMN google_id VARCHAR(100) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar') = 0,
    'ALTER TABLE users ADD COLUMN avatar VARCHAR(500) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'uq_users_google_id') = 0,
    'ALTER TABLE users ADD UNIQUE KEY uq_users_google_id (google_id)',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password' AND IS_NULLABLE = 'NO') > 0,
    'ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'servers' AND COLUMN_NAME = 'quantity') = 0,
    'ALTER TABLE servers ADD COLUMN quantity INT DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'servers' AND COLUMN_NAME = 'visible') = 0,
    'ALTER TABLE servers ADD COLUMN visible BOOLEAN NOT NULL DEFAULT TRUE',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites' AND COLUMN_NAME = 'github_url') = 0,
    'ALTER TABLE sites ADD COLUMN github_url VARCHAR(500) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'payment_url') = 0,
    'ALTER TABLE payments ADD COLUMN payment_url VARCHAR(500) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'gateway') = 0,
    'ALTER TABLE payments ADD COLUMN gateway VARCHAR(20) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'request_id') = 0,
    'ALTER TABLE payments ADD COLUMN request_id VARCHAR(100) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'order_info') = 0,
    'ALTER TABLE payments ADD COLUMN order_info VARCHAR(500) DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'method' AND COLUMN_TYPE LIKE '%PAYOS%') = 0,
    'ALTER TABLE payments MODIFY COLUMN method ENUM(''BANKING'',''MOMO'',''VNPAY'',''CASH'',''PAYOS'') NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @faq_count = (SELECT COUNT(*) FROM faqs);

INSERT INTO faqs (category, question, answer, display_order, active)
SELECT * FROM (
    SELECT 'HOSTING' AS category, 'Giá thuê hosting được tính như thế nào?' AS question,
           'Giá hiển thị theo ngày. Khi đặt hàng bạn chọn số ngày thuê và tổng tiền được tính bằng giá/ngày nhân số ngày.' AS answer,
           1 AS display_order, TRUE AS active
    UNION ALL SELECT 'HOSTING', 'Thanh toán bằng cách nào?',
           'Hệ thống hỗ trợ thanh toán qua PayOS (mã QR) hoặc chuyển khoản. Đơn chuyển khoản sẽ được quản trị viên xác nhận thủ công.',
           2, TRUE
    UNION ALL SELECT 'HOSTING', 'Tôi có thể hủy đơn hàng không?',
           'Bạn có thể hủy đơn khi đơn đang ở trạng thái chờ thanh toán (PENDING).',
           3, TRUE
    UNION ALL SELECT 'HOSTING', 'Website dùng tên miền nào?',
           'Mỗi website hosting được cấp một subdomain dạng ten-ban.bootnode.cloud.',
           4, TRUE
    UNION ALL SELECT 'HOSTING', 'Có hỗ trợ tên miền riêng không?',
           'Hiện hệ thống chưa hỗ trợ gắn tên miền riêng.',
           5, TRUE
    UNION ALL SELECT 'HOSTING', 'Có thể nâng cấp gói trực tiếp không?',
           'Hiện chưa có chức năng nâng cấp trực tiếp trong dashboard. Vui lòng liên hệ để được hỗ trợ.',
           6, TRUE
    UNION ALL SELECT 'DEPLOY', 'Triển khai web tĩnh có mất phí không?',
           'Hoàn toàn miễn phí cho sinh viên Đại học Cần Thơ.',
           1, TRUE
    UNION ALL SELECT 'DEPLOY', 'Ai được phép triển khai web tĩnh?',
           'Chỉ tài khoản có email thuộc @student.ctu.edu.vn (và quản trị viên) mới được triển khai.',
           2, TRUE
    UNION ALL SELECT 'DEPLOY', 'Website cần file gì để triển khai?',
           'Thư mục hoặc repository phải có file index.html ở thư mục gốc.',
           3, TRUE
    UNION ALL SELECT 'DEPLOY', 'Dung lượng tối đa là bao nhiêu?',
           'Mỗi website tĩnh được giới hạn tối đa 50MB.',
           4, TRUE
    UNION ALL SELECT 'DEPLOY', 'Có thể triển khai từ đâu?',
           'Bạn có thể tải lên thư mục hoặc kết nối link repository GitHub.',
           5, TRUE
    UNION ALL SELECT 'DEPLOY', 'Có thể đổi hoặc xóa subdomain không?',
           'Bạn có thể đổi tên miền con hoặc xóa website bất cứ lúc nào trong trang Triển khai.',
           6, TRUE
    UNION ALL SELECT 'DEPLOY', 'Có hỗ trợ PHP, Node.js hay cơ sở dữ liệu không?',
           'Không. Dịch vụ chỉ phục vụ file tĩnh (HTML, CSS, JavaScript, hình ảnh).',
           7, TRUE
    UNION ALL SELECT 'GENERAL', 'Tôi đăng nhập bằng cách nào?',
           'Hệ thống chỉ hỗ trợ đăng nhập bằng tài khoản Google.',
           1, TRUE
    UNION ALL SELECT 'GENERAL', 'Làm sao để liên hệ hỗ trợ?',
           'Bạn có thể xem thông tin liên hệ tại trang Liên hệ.',
           2, TRUE
) AS seed
WHERE @faq_count = 0;

-- Không seed email/số điện thoại cá nhân: admin tự cấu hình trong trang quản trị
-- nếu muốn hiển thị, tránh lộ thông tin trong repo và API công khai.
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
    ('contact.address', 'Đại học Cần Thơ'),
    ('contact.hours', 'Thứ 2 - Thứ 7, 8:00 - 18:00'),
    ('site.brand_name', 'HireHost'),
    ('deploy.allowed_domain', 'student.ctu.edu.vn'),
    ('deploy.max_size_mb', '50'),
    ('home.hero_title', 'Triển khai web tĩnh miễn phí'),
    ('home.hero_subtitle', 'Miễn phí cho sinh viên Đại học Cần Thơ với email @student.ctu.edu.vn.');
