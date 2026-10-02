-- Explicit consent to store health data (medicines and dose history) on the
-- server, as UK GDPR requires for special-category data. Null means the user
-- has not consented yet: the app asks before syncing.
alter table app_user add column health_data_consent_at timestamp;
alter table app_user add column health_data_consent_version varchar(20);
