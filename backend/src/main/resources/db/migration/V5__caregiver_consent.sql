-- A caregiver link is now a request the patient must accept before any of
-- their medication history is shared.
alter table caregiver_relation add column status varchar(20) not null default 'PENDING';
alter table caregiver_relation add column created_at timestamp;
alter table caregiver_relation add column responded_at timestamp;

-- Links created before V5 were made without the patient's consent. They stay
-- PENDING (the column default) until the patient accepts them.
