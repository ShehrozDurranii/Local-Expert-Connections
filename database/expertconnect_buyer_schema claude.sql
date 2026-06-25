-- =============================================================================
-- ExpertConnect Marketplace — BUYER MODULE
-- SQL Schema v2.0 (Updated ERD Implementation)
-- Organization : TradeCafe Inc.
-- Author       : Senior Engineer Review Pass
-- Date         : 2026-01-01
--
-- MODULES COVERED IN THIS FILE:
--   ✅ Buyer Module (this file)
--   🔲 Expert Module (Phase 2 — expert_id FKs will resolve here)
--   🔲 Admin Module  (Phase 3)
--
-- CHANGES FROM ORIGINAL ERD:
--   [FIX-01] Added `city` lookup table  (was raw VARCHAR in request)
--   [FIX-02] Added `category` lookup table (was raw VARCHAR in request)
--   [FIX-03] Fixed `request.budget` type  → DECIMAL(10,2)
--   [FIX-04] Added `audit_log` table (SRS §4.3 — MUST requirement)
--   [FIX-05] Added `payment.gateway_reference`, `captured_at`,
--             `released_at`, `refund_amount` (SRS FR-PAY reconciliation)
--   [FIX-06] Added `orders.completed_at`, `orders.cancelled_at`
--             for state-machine timed transitions (SRS Appendix A)
--   [FIX-07] Added `attachment.scan_status` (SRS §4.1 explicit field)
--   [FIX-08] Added `review.moderation_status`, `review.moderation_reason`
--             (SRS FR-REV-03)
--   [FIX-09] Added `notification_preference.notification_type`
--             (SRS FR-NOTIF-02 — per-event-type toggles)
--   [FIX-10] Added `message.is_reported` flag (SRS FR-COMM-04)
--   [FIX-11] Expert-side FKs marked as CHAR(36) with comments noting
--             they resolve to expert.id in Expert Module (Phase 2)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS expertconnect_db;
CREATE DATABASE expertconnect_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expertconnect_db;

-- =============================================================================
-- SECTION 0: LOOKUP TABLES
-- [FIX-01] city  — was raw VARCHAR in request table
-- [FIX-02] category — was raw VARCHAR in request table
-- Admin manages these via Admin Console (FR-ADMIN-01)
-- =============================================================================

CREATE TABLE city (
    id          CHAR(36)        NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    country     VARCHAR(100)    NOT NULL DEFAULT 'Pakistan',
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_city PRIMARY KEY (id),
    CONSTRAINT uq_city_name UNIQUE (name, country)
) ENGINE=InnoDB COMMENT='[FIX-01] Lookup table for supported cities. Replaces raw VARCHAR city field in request.';


CREATE TABLE category (
    id          CHAR(36)        NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    description TEXT,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_category PRIMARY KEY (id),
    CONSTRAINT uq_category_name UNIQUE (name)
) ENGINE=InnoDB COMMENT='[FIX-02] Lookup table for service categories. Replaces raw VARCHAR category field in request.';


-- =============================================================================
-- SECTION 1: BUYER AUTHENTICATION & ACCOUNT
-- FR-AUTH-01, FR-AUTH-02, FR-AUTH-04, FR-AUTH-05
-- =============================================================================

CREATE TABLE buyer (
    id              CHAR(36)        NOT NULL,
    email           VARCHAR(255)    UNIQUE,
    phone           VARCHAR(20)     UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    status          ENUM(
                        'pending_verification',
                        'active',
                        'suspended',
                        'banned',
                        'deleted'
                    )               NOT NULL DEFAULT 'pending_verification',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_buyer PRIMARY KEY (id),

    -- At least one of email or phone must be provided
    -- Enforced at application layer; documented here for clarity
    CONSTRAINT chk_buyer_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
) ENGINE=InnoDB COMMENT='Core buyer account table. Holds authentication credentials only.';


-- =============================================================================
-- SECTION 2: BUYER PROFILE
-- FR-PROF-01
-- =============================================================================

CREATE TABLE buyer_profile (
    buyer_id            CHAR(36)        NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    photo_url           VARCHAR(500),
    languages           VARCHAR(255)    COMMENT 'Comma-separated language codes e.g. en,ur,ps',
    contact_preferences VARCHAR(255)    COMMENT 'Comma-separated: email, sms, push',
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_buyer_profile PRIMARY KEY (buyer_id),
    CONSTRAINT fk_buyer_profile_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Extended profile info for buyers. Separate from auth (buyer table).';


-- =============================================================================
-- SECTION 3: NOTIFICATION PREFERENCES
-- FR-NOTIF-01, FR-NOTIF-02
-- [FIX-09] Added notification_type column
-- =============================================================================

CREATE TABLE notification_preference (
    id                  CHAR(36)        NOT NULL,
    buyer_id            CHAR(36)        NOT NULL,

    -- [FIX-09] notification_type allows per-event-type toggles (FR-NOTIF-02)
    notification_type   ENUM(
                            'offer_received',
                            'offer_accepted',
                            'payment_success',
                            'payment_failure',
                            'milestone_update',
                            'proof_submitted',
                            'dispute_opened',
                            'refund_issued',
                            'message_received',
                            'security_alert'    -- non-optional per SRS FR-NOTIF-02
                        )               NOT NULL,
    channel             ENUM(
                            'in_app',
                            'email',
                            'sms',
                            'push'
                        )               NOT NULL,
    is_enabled          BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_notification_preference PRIMARY KEY (id),
    CONSTRAINT fk_notif_pref_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_notif_buyer_type_channel
        UNIQUE (buyer_id, notification_type, channel)
) ENGINE=InnoDB COMMENT='[FIX-09] Per buyer, per event-type, per channel notification toggle. FR-NOTIF-02.';


-- =============================================================================
-- SECTION 4: SAVED EXPERTS
-- BuyerProfile.saved_experts (SRS §4.1)
-- expert_id resolves to expert.id in Expert Module (Phase 2)
-- =============================================================================

CREATE TABLE saved_expert (
    id          CHAR(36)    NOT NULL,
    buyer_id    CHAR(36)    NOT NULL,

    -- [FIX-11] FK resolves to expert(id) in Expert Module Phase 2
    expert_id   CHAR(36)    NOT NULL COMMENT 'FK → expert.id (Expert Module Phase 2)',

    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_saved_expert PRIMARY KEY (id),
    CONSTRAINT fk_saved_expert_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_saved_expert UNIQUE (buyer_id, expert_id)
) ENGINE=InnoDB COMMENT='Buyers can bookmark/save expert profiles for later reference.';


-- =============================================================================
-- SECTION 5: REQUEST
-- FR-REQ-01
-- [FIX-01] city_id FK → city.id
-- [FIX-02] category_id FK → category.id
-- [FIX-03] budget → DECIMAL(10,2)
-- =============================================================================

CREATE TABLE request (
    id              CHAR(36)        NOT NULL,
    buyer_id        CHAR(36)        NOT NULL,

    -- [FIX-01] city_id replaces raw VARCHAR city
    city_id         CHAR(36)        NOT NULL COMMENT '[FIX-01] FK → city.id',

    -- [FIX-02] category_id replaces raw VARCHAR category
    category_id     CHAR(36)        NOT NULL COMMENT '[FIX-02] FK → category.id',

    description     TEXT            NOT NULL,

    -- [FIX-03] budget was missing type — now DECIMAL(10,2)
    budget          DECIMAL(10,2)   NOT NULL COMMENT '[FIX-03] Was missing data type in original ERD',

    timeline        TIMESTAMP       NOT NULL COMMENT 'Buyer-specified deadline for task completion',
    item_links      TEXT            COMMENT 'Comma-separated or JSON array of product/item URLs',
    status          ENUM(
                        'draft',
                        'submitted',
                        'offered',
                        'accepted',
                        'cancelled',
                        'closed'
                    )               NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_request PRIMARY KEY (id),
    CONSTRAINT fk_request_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_request_city
        FOREIGN KEY (city_id) REFERENCES city(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_request_category
        FOREIGN KEY (category_id) REFERENCES category(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Buyer request for local expert help. Core entity of the marketplace.';


-- =============================================================================
-- SECTION 6: OFFER
-- FR-REQ-02, FR-REQ-04
-- expert_id resolves to expert.id in Expert Module (Phase 2)
-- =============================================================================

CREATE TABLE offer (
    id          CHAR(36)        NOT NULL,
    request_id  CHAR(36)        NOT NULL,

    -- [FIX-11] FK resolves to expert(id) in Expert Module Phase 2
    expert_id   CHAR(36)        NOT NULL COMMENT 'FK → expert.id (Expert Module Phase 2)',

    price       DECIMAL(10,2)   NOT NULL,
    eta         VARCHAR(100)    NOT NULL COMMENT 'Human-readable ETA e.g. "2 business days"',
    scope_notes TEXT,
    status      ENUM(
                    'pending',
                    'accepted',
                    'declined',
                    'withdrawn',
                    'expired'
                )               NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_offer PRIMARY KEY (id),
    CONSTRAINT fk_offer_request
        FOREIGN KEY (request_id) REFERENCES request(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Expert proposal in response to a buyer request. FR-REQ-02.';


-- =============================================================================
-- SECTION 7: ORDERS
-- FR-ORD-01 through FR-ORD-05
-- [FIX-06] Added completed_at, cancelled_at for state-machine timed transitions
-- expert_id resolves to expert.id in Expert Module (Phase 2)
-- =============================================================================

CREATE TABLE orders (
    id              CHAR(36)    NOT NULL,
    buyer_id        CHAR(36)    NOT NULL,

    -- [FIX-11] FK resolves to expert(id) in Expert Module Phase 2
    expert_id       CHAR(36)    NOT NULL COMMENT 'FK → expert.id (Expert Module Phase 2)',

    offer_id        CHAR(36)    NOT NULL,

    -- Full state machine from SRS Appendix A
    state           ENUM(
                        'draft',
                        'submitted',
                        'offered',
                        'accepted',
                        'funded',
                        'in_progress',
                        'proof_submitted',
                        'completed',
                        'disputed',
                        'refunded',
                        'cancelled',
                        'closed'
                    )           NOT NULL DEFAULT 'draft',

    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- [FIX-06] Timestamps for key state transitions
    -- Required for auto-release timer (FR-PROOF-03) and SLA tracking
    completed_at    TIMESTAMP   NULL COMMENT '[FIX-06] Set when state → completed',
    cancelled_at    TIMESTAMP   NULL COMMENT '[FIX-06] Set when state → cancelled',

    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT fk_orders_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_offer
        FOREIGN KEY (offer_id) REFERENCES offer(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Funded and active order. Implements state machine from SRS Appendix A.';


-- =============================================================================
-- SECTION 8: PAYMENT
-- FR-PAY-01 through FR-PAY-04
-- [FIX-05] Added gateway_reference, captured_at, released_at, refund_amount
-- =============================================================================

CREATE TABLE payment (
    id                  CHAR(36)        NOT NULL,
    order_id            CHAR(36)        NOT NULL,

    base_amount         DECIMAL(10,2)   NOT NULL COMMENT 'Expert fee agreed in offer',
    platform_fee        DECIMAL(10,2)   NOT NULL DEFAULT 0.00 COMMENT 'Platform commission (FR-PAY-03)',
    total_amount        DECIMAL(10,2)   NOT NULL COMMENT 'base_amount + platform_fee',

    escrow_status       ENUM(
                            'pending',
                            'captured',
                            'released',
                            'refunded',
                            'partially_refunded',
                            'failed'
                        )               NOT NULL DEFAULT 'pending',

    -- [FIX-05] Payment gateway fields for reconciliation (NFR-OBS-02)
    gateway_reference   VARCHAR(255)    NULL COMMENT '[FIX-05] Transaction ID from payment gateway',
    captured_at         TIMESTAMP       NULL COMMENT '[FIX-05] When escrow was successfully funded',
    released_at         TIMESTAMP       NULL COMMENT '[FIX-05] When funds were released to expert',
    refund_amount       DECIMAL(10,2)   NULL DEFAULT 0.00
                                        COMMENT '[FIX-05] Supports partial refunds (FR-PAY-04)',

    CONSTRAINT pk_payment PRIMARY KEY (id),
    CONSTRAINT uq_payment_order UNIQUE (order_id),
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amounts
        CHECK (total_amount = base_amount + platform_fee)
) ENGINE=InnoDB COMMENT='Escrow payment record per order. [FIX-05] includes gateway + reconciliation fields.';


-- =============================================================================
-- SECTION 9: MILESTONE
-- FR-ORD-02
-- =============================================================================

CREATE TABLE milestone (
    id          CHAR(36)    NOT NULL,
    order_id    CHAR(36)    NOT NULL,
    state       ENUM(
                    'accepted',
                    'in_progress',
                    'proof_submitted',
                    'completed',
                    'disputed',
                    'cancelled'
                )           NOT NULL COMMENT 'Controlled vocab — mirrors order state machine',
    notes       TEXT        COMMENT 'Expert-added update notes visible to buyer (FR-ORD-02)',
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_milestone PRIMARY KEY (id),
    CONSTRAINT fk_milestone_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Immutable log of order state transitions. FR-ORD-02.';


-- =============================================================================
-- SECTION 10: PROOF
-- FR-PROOF-01, FR-PROOF-02, FR-PROOF-03
-- =============================================================================

CREATE TABLE proof (
    id                  CHAR(36)        NOT NULL,
    order_id            CHAR(36)        NOT NULL,
    milestone_id        CHAR(36)        NOT NULL,
    notes               TEXT            COMMENT 'Expert text notes accompanying proof',
    approval_status     ENUM(
                            'pending',
                            'approved',
                            'rejected',
                            'auto_released'
                        )               NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT            NULL COMMENT 'Required when buyer rejects proof (FR-ORD-03)',
    submitted_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_proof PRIMARY KEY (id),
    CONSTRAINT fk_proof_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_proof_milestone
        FOREIGN KEY (milestone_id) REFERENCES milestone(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Expert-submitted proof of service package per milestone. FR-PROOF-01.';


-- =============================================================================
-- SECTION 11: MESSAGE
-- FR-COMM-01, FR-COMM-04
-- [FIX-10] Added is_reported flag
-- sender_id resolves to buyer.id or expert.id (polymorphic — noted)
-- =============================================================================

CREATE TABLE message (
    id          CHAR(36)    NOT NULL,
    order_id    CHAR(36)    NOT NULL,

    -- Polymorphic sender: can be buyer or expert
    -- In Buyer module context, buyer sends; expert_id resolves in Phase 2
    sender_id   CHAR(36)    NOT NULL COMMENT 'FK → buyer.id or expert.id (polymorphic)',
    sender_role ENUM('buyer','expert') NOT NULL COMMENT 'Disambiguates polymorphic sender_id',

    content     TEXT        NOT NULL,

    -- [FIX-10] Individual message reporting (FR-COMM-04)
    is_reported BOOLEAN     NOT NULL DEFAULT FALSE
                            COMMENT '[FIX-10] True when this message has been reported for review',

    timestamp   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_message PRIMARY KEY (id),
    CONSTRAINT fk_message_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Real-time chat messages per order. [FIX-10] includes is_reported. FR-COMM-01.';


-- =============================================================================
-- SECTION 12: ATTACHMENT
-- FR-COMM-03, FR-PROOF-01
-- [FIX-07] Added scan_status (SRS §4.1 explicit field)
-- =============================================================================

CREATE TABLE attachment (
    id              CHAR(36)        NOT NULL,
    order_id        CHAR(36)        NOT NULL,
    proof_id        CHAR(36)        NULL COMMENT 'Set when attachment belongs to a proof submission',
    message_id      CHAR(36)        NULL COMMENT 'Set when attachment is sent via chat message',

    file_url        VARCHAR(500)    NOT NULL COMMENT 'Object storage URL (CDN path)',
    file_type       ENUM(
                        'image',
                        'video',
                        'pdf',
                        'receipt'
                    )               NOT NULL,
    file_size_bytes INT             UNSIGNED NULL COMMENT 'For enforcement of 25MB limit (FR-COMM-03)',

    uploaded_by     CHAR(36)        NOT NULL COMMENT 'FK → buyer.id or expert.id (polymorphic)',
    uploader_role   ENUM('buyer','expert') NOT NULL,

    -- [FIX-07] scan_status — SRS §4.1 explicit field
    scan_status     ENUM(
                        'pending',
                        'clean',
                        'flagged',
                        'quarantined'
                    )               NOT NULL DEFAULT 'pending'
                    COMMENT '[FIX-07] Malware/content scan status before file is served',

    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_attachment PRIMARY KEY (id),
    CONSTRAINT fk_attachment_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_attachment_proof
        FOREIGN KEY (proof_id) REFERENCES proof(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_attachment_message
        FOREIGN KEY (message_id) REFERENCES message(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Attachment must belong to either a proof or a message, not neither
    CONSTRAINT chk_attachment_context
        CHECK (proof_id IS NOT NULL OR message_id IS NOT NULL)
) ENGINE=InnoDB COMMENT='Media files. [FIX-07] scan_status added per SRS §4.1.';


-- =============================================================================
-- SECTION 13: REVIEW
-- FR-REV-01, FR-REV-02, FR-REV-03
-- [FIX-08] Added moderation_status, moderation_reason
-- =============================================================================

CREATE TABLE review (
    id                  CHAR(36)    NOT NULL,
    order_id            CHAR(36)    NOT NULL,
    buyer_id            CHAR(36)    NOT NULL,

    -- [FIX-11] FK resolves to expert(id) in Expert Module Phase 2
    expert_id           CHAR(36)    NOT NULL COMMENT 'FK → expert.id (Expert Module Phase 2)',

    rating              TINYINT     NOT NULL COMMENT '1–5 star rating (FR-REV-01)',
    comment             TEXT        NULL,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- [FIX-08] Admin moderation fields (FR-REV-03)
    moderation_status   ENUM(
                            'active',
                            'flagged',
                            'removed'
                        )           NOT NULL DEFAULT 'active'
                        COMMENT '[FIX-08] Admin can remove reviews; removed ones stay in audit logs',
    moderation_reason   TEXT        NULL
                        COMMENT '[FIX-08] Required reason when Admin removes a review (FR-REV-03)',

    CONSTRAINT pk_review PRIMARY KEY (id),
    CONSTRAINT uq_review_order UNIQUE (order_id) COMMENT 'One review per order (FR-REV-01)',
    CONSTRAINT fk_review_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_review_buyer
        FOREIGN KEY (buyer_id) REFERENCES buyer(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB COMMENT='Post-completion review by buyer. [FIX-08] moderation fields added. FR-REV-01.';


-- =============================================================================
-- SECTION 14: BLOCKLIST
-- FR-SAFE-02
-- =============================================================================

CREATE TABLE blocklist (
    id              CHAR(36)    NOT NULL,
    blocker_id      CHAR(36)    NOT NULL COMMENT 'The buyer who is blocking',
    blocked_user_id CHAR(36)    NOT NULL COMMENT 'FK → buyer.id or expert.id (polymorphic)',
    blocked_role    ENUM('buyer','expert') NOT NULL COMMENT 'Disambiguates who was blocked',
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_blocklist PRIMARY KEY (id),
    CONSTRAINT fk_blocklist_blocker
        FOREIGN KEY (blocker_id) REFERENCES buyer(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_blocklist UNIQUE (blocker_id, blocked_user_id)
) ENGINE=InnoDB COMMENT='Buyer-initiated blocks. FR-SAFE-02.';


-- =============================================================================
-- SECTION 15: REPORT
-- FR-SAFE-01
-- =============================================================================

CREATE TABLE report (
    id              CHAR(36)        NOT NULL,
    reporter_id     CHAR(36)        NOT NULL COMMENT 'Buyer filing the report',
    order_id        CHAR(36)        NOT NULL,
    reported_user_id CHAR(36)       NOT NULL COMMENT 'FK → buyer.id or expert.id (polymorphic)',
    reported_role   ENUM('buyer','expert') NOT NULL,
    category        ENUM(
                        'fraud',
                        'harassment',
                        'prohibited_item',
                        'fake_proof',
                        'other'
                    )               NOT NULL,
    evidence_notes  TEXT,
    status          ENUM(
                        'open',
                        'under_review',
                        'resolved',
                        'dismissed'
                    )               NOT NULL DEFAULT 'open',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_report PRIMARY KEY (id),
    CONSTRAINT fk_report_reporter
        FOREIGN KEY (reporter_id) REFERENCES buyer(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_report_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Safety reports filed by buyers. FR-SAFE-01.';


-- =============================================================================
-- SECTION 16: AUDIT LOG
-- SRS §4.3 — MUST requirement
-- [FIX-04] This table was completely missing from original ERD
-- =============================================================================

CREATE TABLE audit_log (
    id              CHAR(36)        NOT NULL,
    actor_id        CHAR(36)        NOT NULL COMMENT 'buyer.id, expert.id, or admin.id who performed the action',
    actor_role      ENUM(
                        'buyer',
                        'expert',
                        'admin',
                        'system'
                    )               NOT NULL,
    action          VARCHAR(100)    NOT NULL COMMENT 'e.g. LOGIN_SUCCESS, PAYMENT_CAPTURED, ORDER_STATE_CHANGED',
    entity_type     VARCHAR(50)     NULL COMMENT 'e.g. order, payment, review',
    entity_id       CHAR(36)        NULL COMMENT 'ID of the affected record',
    before_state    JSON            NULL COMMENT 'Snapshot before change (FR-ORD state transitions)',
    after_state     JSON            NULL COMMENT 'Snapshot after change',
    ip_address      VARCHAR(45)     NULL COMMENT 'IPv4 or IPv6 — FR-AUTH-05',
    device_metadata VARCHAR(500)    NULL COMMENT 'User-agent / device info — FR-AUTH-05',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_audit_log PRIMARY KEY (id)
    -- Intentionally NO foreign keys — audit logs are immutable and
    -- must survive deletion of the referenced entity (SRS §4.3)
) ENGINE=InnoDB COMMENT='[FIX-04] Immutable audit trail. SRS §4.3 MUST requirement. No FKs by design.';


-- =============================================================================
-- INDEXES
-- For query performance on the most common access patterns
-- =============================================================================

-- buyer lookups
CREATE INDEX idx_buyer_email   ON buyer(email);
CREATE INDEX idx_buyer_phone   ON buyer(phone);
CREATE INDEX idx_buyer_status  ON buyer(status);

-- request browsing
CREATE INDEX idx_request_buyer    ON request(buyer_id);
CREATE INDEX idx_request_city     ON request(city_id);
CREATE INDEX idx_request_category ON request(category_id);
CREATE INDEX idx_request_status   ON request(status);
CREATE INDEX idx_request_created  ON request(created_at);

-- offer lookup per request
CREATE INDEX idx_offer_request    ON offer(request_id);
CREATE INDEX idx_offer_expert     ON offer(expert_id);
CREATE INDEX idx_offer_status     ON offer(status);

-- orders
CREATE INDEX idx_orders_buyer   ON orders(buyer_id);
CREATE INDEX idx_orders_expert  ON orders(expert_id);
CREATE INDEX idx_orders_state   ON orders(state);

-- messages (chat history per order)
CREATE INDEX idx_message_order      ON message(order_id);
CREATE INDEX idx_message_timestamp  ON message(timestamp);
CREATE INDEX idx_message_reported   ON message(is_reported);

-- attachments
CREATE INDEX idx_attachment_order   ON attachment(order_id);
CREATE INDEX idx_attachment_proof   ON attachment(proof_id);
CREATE INDEX idx_attachment_message ON attachment(message_id);

-- milestones (timeline per order)
CREATE INDEX idx_milestone_order    ON milestone(order_id);
CREATE INDEX idx_milestone_created  ON milestone(created_at);

-- audit log (searched by admin — FR-AUTH-05)
CREATE INDEX idx_audit_actor      ON audit_log(actor_id);
CREATE INDEX idx_audit_action     ON audit_log(action);
CREATE INDEX idx_audit_entity     ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created    ON audit_log(created_at);

-- reviews
CREATE INDEX idx_review_expert    ON review(expert_id);
CREATE INDEX idx_review_buyer     ON review(buyer_id);
CREATE INDEX idx_review_modstatus ON review(moderation_status);

-- reports
CREATE INDEX idx_report_reporter  ON report(reporter_id);
CREATE INDEX idx_report_status    ON report(status);

-- blocklist
CREATE INDEX idx_blocklist_blocker ON blocklist(blocker_id);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- END OF SCHEMA — ExpertConnect Buyer Module v2.0
-- =============================================================================
