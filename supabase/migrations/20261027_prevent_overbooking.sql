-- Prevent overbooking at the database level.
-- This trigger runs BEFORE INSERT on requests and raises an exception
-- if the slot already has max_slots active (Pending or Approved) requests.
-- Because it runs inside the same transaction as the INSERT, two concurrent
-- inserts cannot both pass — whichever commits second will hit the guard.

CREATE OR REPLACE FUNCTION check_slot_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_max_slots  INTEGER;
  v_filled     INTEGER;
BEGIN
  -- Only enforce for Pending/Approved inserts
  IF NEW.status NOT IN ('Pending', 'Approved') THEN
    RETURN NEW;
  END IF;

  -- Get max_slots for this schedule
  SELECT max_slots INTO v_max_slots
  FROM schedules
  WHERE id = NEW.schedule_id;

  IF v_max_slots IS NULL THEN
    RETURN NEW; -- no schedule row found, allow
  END IF;

  -- Count current active requests for this slot (lock the rows to prevent races)
  SELECT COUNT(*) INTO v_filled
  FROM requests
  WHERE schedule_id = NEW.schedule_id
    AND status IN ('Pending', 'Approved')
    AND id != NEW.id
  FOR UPDATE;

  IF v_filled >= v_max_slots THEN
    RAISE EXCEPTION 'SLOT_FULL: schedule % is fully booked (% / % slots)', NEW.schedule_id, v_filled, v_max_slots
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists then recreate
DROP TRIGGER IF EXISTS trg_check_slot_capacity ON requests;

CREATE TRIGGER trg_check_slot_capacity
  BEFORE INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION check_slot_capacity();
