import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1702669200000 implements MigrationInterface {
    name = 'InitialSchema1702669200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "repository" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "owner" character varying NOT NULL,
                "description" text,
                "fullName" character varying NOT NULL,
                "githubId" integer NOT NULL UNIQUE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "isArchived" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_b842c26651c6fc0b9ccd1c530e7" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "release" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "version" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "releaseDate" TIMESTAMP NOT NULL,
                "githubId" character varying NOT NULL,
                "seen" boolean NOT NULL DEFAULT false,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "repositoryId" uuid,
                CONSTRAINT "PK_f558cba3f37acc3b3154c160c72" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "release"
            ADD CONSTRAINT "FK_release_repository"
            FOREIGN KEY ("repositoryId")
            REFERENCES "repository"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release" DROP CONSTRAINT "FK_release_repository"`);
        await queryRunner.query(`DROP TABLE "release"`);
        await queryRunner.query(`DROP TABLE "repository"`);
    }
} 