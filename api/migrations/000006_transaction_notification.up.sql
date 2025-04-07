BEGIN;

CREATE OR REPLACE FUNCTION notify_new_transaction()
    RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_transaction', json_build_object('id', NEW.id)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_insert_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
EXECUTE FUNCTION notify_new_transaction();

COMMIT;
