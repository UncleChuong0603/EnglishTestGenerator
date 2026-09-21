DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM media_assets WHERE storage_provider <> 'LOCAL') THEN
    RAISE EXCEPTION 'MEDIA_CUTOVER_INCOMPLETE: run media:finalize-local after copying and verifying the media volume';
  END IF;
END $$;

ALTER TABLE "media_assets" ALTER COLUMN "storage_provider" SET DEFAULT 'LOCAL';
ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_provider_check";
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_provider_check" CHECK ("storage_provider" = 'LOCAL');
