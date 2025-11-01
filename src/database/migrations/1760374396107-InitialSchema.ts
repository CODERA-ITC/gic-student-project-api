import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760374396107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Baseline migration - schema already exists via synchronize
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No rollback needed for baseline
  }
}
