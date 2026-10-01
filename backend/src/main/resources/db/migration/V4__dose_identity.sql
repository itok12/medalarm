-- Which dose a log answers: the alarm's wall-clock time on that day in the
-- user's timezone (e.g. 2026-10-01 08:00). Null for rows written before V4.
alter table medication_log add column scheduled_for timestamp;

-- A dose can hold at most one row per status, so a double-tapped "Taken" or a
-- retried request cannot be stored (or decrement the pill count) twice.
-- Legacy rows have a null scheduled_for and are not constrained.
alter table medication_log
    add constraint uk_medication_log_dose_status unique (alarm_id, scheduled_for, status);
