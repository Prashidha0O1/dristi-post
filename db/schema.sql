-- ============================================================================
-- Dristi Times — MySQL / MariaDB schema
-- ============================================================================
-- Import this once into the cPanel database (phpMyAdmin > Import, or the SQL
-- tab). It is safe to re-run: every CREATE uses IF NOT EXISTS.
--
-- Notes that matter:
--  * Column names are camelCase and backticked, matching the domain mappers so
--    the data layer needs no renaming.
--  * ENUM values are the UPPERCASE Postgres values (DRAFT, KOSHI, FULL_TIME,
--    HOME_TOP ...) so a straight export from Supabase imports without remapping.
--  * ids are CHAR(36) with NO database default — the application's id generator
--    supplies them, which keeps this portable and deterministic.
--  * timestamps are DATETIME(3) and are always written in UTC by the app.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Reference tables (must exist before articles, which point at them)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `id`   CHAR(36)     NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `authors` (
  `id`     CHAR(36)     NOT NULL,
  `nameNe` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tags` (
  `id`   CHAR(36)     NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
-- titleNe/excerptNe/bodyNe are NOT NULL but may be "" — a single-language
-- (English-only) article stores "" for the Nepali side, and the app treats ""
-- as absent. The English columns are nullable.

CREATE TABLE IF NOT EXISTS `articles` (
  `id`          CHAR(36)     NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `titleNe`     VARCHAR(512) NOT NULL,
  `titleEn`     VARCHAR(512) NULL,
  `excerptNe`   TEXT         NOT NULL,
  `excerptEn`   TEXT         NULL,
  `bodyNe`      MEDIUMTEXT   NOT NULL,
  `bodyEn`      MEDIUMTEXT   NULL,
  `imageUrl`    VARCHAR(1024) NOT NULL,
  `status`      ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `province`    ENUM('KOSHI','MADHESH','BAGMATI','GANDAKI','LUMBINI','KARNALI','SUDURPASHCHIM') NULL,
  `categoryId`  CHAR(36)     NOT NULL,
  `authorId`    CHAR(36)     NOT NULL,
  `isFeatured`  TINYINT(1)   NOT NULL DEFAULT 0,
  `isBreaking`  TINYINT(1)   NOT NULL DEFAULT 0,
  `isTrending`  TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `publishedAt` DATETIME(3)  NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_articles_slug` (`slug`),
  KEY `idx_articles_status_published` (`status`, `publishedAt`),
  KEY `idx_articles_category` (`categoryId`),
  KEY `idx_articles_author` (`authorId`),
  KEY `idx_articles_flags` (`isFeatured`, `isBreaking`, `isTrending`),
  CONSTRAINT `fk_articles_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_articles_author`   FOREIGN KEY (`authorId`)   REFERENCES `authors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Many-to-many article<->tag. (Replaces Prisma's implicit _ArticleTags/A/B.)
CREATE TABLE IF NOT EXISTS `article_tags` (
  `articleId` CHAR(36) NOT NULL,
  `tagId`     CHAR(36) NOT NULL,
  PRIMARY KEY (`articleId`, `tagId`),
  KEY `idx_article_tags_tag` (`tagId`),
  CONSTRAINT `fk_article_tags_article` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_tags_tag`     FOREIGN KEY (`tagId`)     REFERENCES `tags` (`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `jobs` (
  `id`             CHAR(36)     NOT NULL,
  `slug`           VARCHAR(191) NOT NULL,
  `titleNe`        VARCHAR(512) NOT NULL,
  `titleEn`        VARCHAR(512) NULL,
  `company`        VARCHAR(255) NOT NULL,
  `location`       VARCHAR(255) NOT NULL,
  `province`       ENUM('KOSHI','MADHESH','BAGMATI','GANDAKI','LUMBINI','KARNALI','SUDURPASHCHIM') NULL,
  `employmentType` ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE') NOT NULL,
  `descriptionNe`  MEDIUMTEXT   NOT NULL,
  `descriptionEn`  MEDIUMTEXT   NULL,
  `salary`         VARCHAR(255) NULL,
  `deadline`       DATE         NULL,
  `applyUrl`       VARCHAR(1024) NOT NULL,
  `status`         ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `isFeatured`     TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `publishedAt`    DATETIME(3)  NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jobs_slug` (`slug`),
  KEY `idx_jobs_status_deadline` (`status`, `deadline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Ads
-- ---------------------------------------------------------------------------
-- Postgres enforced "one active ad per placement" with a partial unique index
-- (WHERE isActive = true). MySQL has no partial indexes, so the same guarantee
-- is expressed with a generated column: `activePlacement` equals the placement
-- while active and NULL while inactive. A UNIQUE key on it lets many inactive
-- ads share a placement (all NULL, and NULLs don't collide) while only one
-- active ad per placement is possible.

CREATE TABLE IF NOT EXISTS `ads` (
  `id`              CHAR(36)     NOT NULL,
  `placement`       ENUM('HOME_TOP','HOME_MID','HOME_LEAD_RAIL','HOME_LATEST_RAIL','SIDEBAR') NOT NULL,
  `imageUrl`        VARCHAR(1024) NOT NULL,
  `linkUrl`         VARCHAR(1024) NOT NULL,
  `altText`         VARCHAR(512) NOT NULL,
  `isActive`        TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `activePlacement` VARCHAR(32)
    GENERATED ALWAYS AS (CASE WHEN `isActive` = 1 THEN `placement` ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ads_one_active_per_placement` (`activePlacement`),
  KEY `idx_ads_placement_active` (`placement`, `isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Auth (used from Phase 2 — created now so the import is one step)
-- ---------------------------------------------------------------------------
-- Owner > Admin > Editor. passwordHash is wide enough for bcrypt or argon2.
-- Users are deactivated (isActive = 0), never deleted, so authorship survives.

CREATE TABLE IF NOT EXISTS `users` (
  `id`              CHAR(36)     NOT NULL,
  `email`           VARCHAR(255) NOT NULL,
  `passwordHash`    VARCHAR(255) NOT NULL,
  `name`            VARCHAR(191) NOT NULL,
  `role`            ENUM('OWNER','ADMIN','EDITOR') NOT NULL DEFAULT 'EDITOR',
  `isActive`        TINYINT(1)   NOT NULL DEFAULT 1,
  `emailVerifiedAt` DATETIME(3)  NULL,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id`        CHAR(64)    NOT NULL,   -- opaque random token, stored hashed
  `userId`    CHAR(36)    NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`userId`),
  KEY `idx_sessions_expires` (`expiresAt`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invites` (
  `id`         CHAR(36)     NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `role`       ENUM('ADMIN','EDITOR') NOT NULL DEFAULT 'EDITOR',
  `token`      CHAR(64)     NOT NULL,
  `invitedBy`  CHAR(36)     NOT NULL,
  `expiresAt`  DATETIME(3)  NOT NULL,
  `acceptedAt` DATETIME(3)  NULL,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invites_token` (`token`),
  KEY `idx_invites_email` (`email`),
  CONSTRAINT `fk_invites_inviter` FOREIGN KEY (`invitedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
