-- SQL generado por Django para SQLite a partir de las migraciones del M54.
-- Fuente: python manage.py sqlmigrate tracking 0001, tracking 0002, tracking 0003
--         y python manage.py sqlmigrate accounts 0002.
-- Las tablas son tracking_guide y tracking_statushistory, más el campo department de accounts_user.
-- La restricción del formato del número de guía usa REGEXP: Django registra esa función en su
-- conexión SQLite; en un cliente sqlite3 suelto no existe. En PostgreSQL es nativa.
BEGIN;
--
-- Create model Guide
--
CREATE TABLE "tracking_guide" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "tracking_number" varchar(22) NOT NULL UNIQUE, "origin" varchar(100) NOT NULL, "destination" varchar(100) NOT NULL, "recipient" varchar(255) NOT NULL, "service_level" varchar(10) NOT NULL, "current_stage" varchar(20) NOT NULL, "is_archived" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, CONSTRAINT "tracking_number_format" CHECK ("tracking_number" REGEXP '^(21[0-9]{14}|[A-Z0-9]{22})$'));
--
-- Create model StatusHistory
--
CREATE TABLE "tracking_statushistory" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "stage" varchar(20) NOT NULL, "timestamp" datetime NOT NULL, "location" varchar(100) NOT NULL, "note" text NOT NULL, "guide_id" bigint NOT NULL REFERENCES "tracking_guide" ("id") DEFERRABLE INITIALLY DEFERRED, "updated_by_id" bigint NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "unique_stage_per_guide" UNIQUE ("guide_id", "stage"));
CREATE INDEX "tracking_statushistory_guide_id_607df2eb" ON "tracking_statushistory" ("guide_id");
CREATE INDEX "tracking_statushistory_updated_by_id_ff37c392" ON "tracking_statushistory" ("updated_by_id");
COMMIT;
--
-- Alter field tracking_number on guide
--
-- (no-op)
COMMIT;
--
-- Create constraint current_stage_valid on model guide
--
CREATE TABLE "new__tracking_guide" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "tracking_number" varchar(22) NOT NULL UNIQUE, "origin" varchar(100) NOT NULL, "destination" varchar(100) NOT NULL, "recipient" varchar(255) NOT NULL, "service_level" varchar(10) NOT NULL, "current_stage" varchar(20) NOT NULL, "is_archived" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, CONSTRAINT "tracking_number_format" CHECK ("tracking_number" REGEXP '^(21[0-9]{14}|[A-Z0-9]{22})$'), CONSTRAINT "current_stage_valid" CHECK ("current_stage" IN ('cargo_received', 'vehicle_loaded', 'vehicle_released', 'vehicle_in_transit', 'cargo_delivered')));
INSERT INTO "new__tracking_guide" ("id", "tracking_number", "origin", "destination", "recipient", "service_level", "current_stage", "is_archived", "created_at", "updated_at") SELECT "id", "tracking_number", "origin", "destination", "recipient", "service_level", "current_stage", "is_archived", "created_at", "updated_at" FROM "tracking_guide";
DROP TABLE "tracking_guide";
ALTER TABLE "new__tracking_guide" RENAME TO "tracking_guide";
COMMIT;
-- accounts: campo department (M54)
BEGIN;
--
-- Add field department to user
--
CREATE TABLE "new__accounts_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "department" varchar(20) NOT NULL, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "username" varchar(150) NOT NULL UNIQUE, "first_name" varchar(150) NOT NULL, "last_name" varchar(150) NOT NULL, "email" varchar(254) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL);
INSERT INTO "new__accounts_user" ("id", "password", "last_login", "is_superuser", "username", "first_name", "last_name", "email", "is_staff", "is_active", "date_joined", "department") SELECT "id", "password", "last_login", "is_superuser", "username", "first_name", "last_name", "email", "is_staff", "is_active", "date_joined", '' FROM "accounts_user";
DROP TABLE "accounts_user";
ALTER TABLE "new__accounts_user" RENAME TO "accounts_user";
COMMIT;
