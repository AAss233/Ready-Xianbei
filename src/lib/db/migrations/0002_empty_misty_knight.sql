CREATE TABLE IF NOT EXISTS "review_votes" (
	"review_id" text NOT NULL,
	"voter_token" text NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_votes_review_id_voter_token_pk" PRIMARY KEY("review_id","voter_token")
);
--> statement-breakpoint
ALTER TABLE "review_replies" ADD COLUMN IF NOT EXISTS "parent_reply_id" text;