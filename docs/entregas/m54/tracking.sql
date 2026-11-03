-- Esquema final de las entidades del M54 para SQLite, con las migraciones
-- accounts 0001 a 0003 y tracking 0001 a 0005 ya aplicadas.
-- Fuente: python manage.py migrate, y el esquema guardado en sqlite_master.
-- La restricción del formato del número de guía usa REGEXP: Django registra esa función en
-- cada conexión SQLite. La línea de comandos de sqlite3 carga este script, pero un cliente sin
-- REGEXP puede fallar al crearlo o al insertar: en Python hay que registrarla antes con
-- create_function. En PostgreSQL es nativa.

-- Tabla accounts_user
CREATE TABLE "accounts_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "username" varchar(150) NOT NULL UNIQUE, "first_name" varchar(150) NOT NULL, "last_name" varchar(150) NOT NULL, "email" varchar(254) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL, "department" varchar(20) NOT NULL, "updated_at" datetime NOT NULL);

-- Tabla tracking_guide
CREATE TABLE "tracking_guide" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "tracking_number" varchar(22) NOT NULL UNIQUE, "origin" varchar(100) NOT NULL, "destination" varchar(100) NOT NULL, "recipient" varchar(255) NOT NULL, "service_level" varchar(10) NOT NULL, "current_stage" varchar(20) NOT NULL, "is_archived" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, CONSTRAINT "tracking_number_format" CHECK ("tracking_number" REGEXP '^(21[0-9]{14}|[A-Z0-9]{22})$'), CONSTRAINT "current_stage_valid" CHECK ("current_stage" IN ('cargo_received', 'vehicle_loaded', 'vehicle_released', 'vehicle_in_transit', 'cargo_delivered')), CONSTRAINT "service_level_valid" CHECK ("service_level" IN ('standard', 'priority')));

-- Tabla tracking_statushistory
CREATE TABLE "tracking_statushistory" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "stage" varchar(20) NOT NULL, "timestamp" datetime NOT NULL, "location" varchar(100) NOT NULL, "note" text NOT NULL, "guide_id" bigint NOT NULL REFERENCES "tracking_guide" ("id") DEFERRABLE INITIALLY DEFERRED, "updated_by_id" bigint NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "department" varchar(20) NOT NULL, CONSTRAINT "unique_stage_per_guide" UNIQUE ("guide_id", "stage"));

CREATE INDEX "tracking_statushistory_guide_id_607df2eb" ON "tracking_statushistory" ("guide_id");

CREATE INDEX "tracking_statushistory_updated_by_id_ff37c392" ON "tracking_statushistory" ("updated_by_id");

-- Tabla tracking_stagetransitionattempt
CREATE TABLE "tracking_stagetransitionattempt" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "requested_stage" varchar(20) NOT NULL, "current_stage" varchar(20) NOT NULL, "attempted_at" datetime NOT NULL, "reason" varchar(20) NOT NULL, "attempted_by_id" bigint NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "guide_id" bigint NOT NULL REFERENCES "tracking_guide" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE INDEX "tracking_stagetransitionattempt_attempted_by_id_77c3f410" ON "tracking_stagetransitionattempt" ("attempted_by_id");

CREATE INDEX "tracking_stagetransitionattempt_guide_id_e0ba40ad" ON "tracking_stagetransitionattempt" ("guide_id");
