import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm'

export class AddProjectViewCount1734800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add viewCount column to projects table
        await queryRunner.addColumn(
            'projects',
            new TableColumn({
                name: 'viewCount',
                type: 'integer',
                default: 0,
            }),
        )

        // Create project_views table
        await queryRunner.createTable(
            new Table({
                name: 'project_views',
                columns: [
                    {
                        name: 'id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'projectId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'viewedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                uniques: [
                    {
                        name: 'UQ_project_views_userId_projectId',
                        columnNames: ['userId', 'projectId'],
                    },
                ],
            }),
            true,
        )

        // Add foreign key for userId
        await queryRunner.createForeignKey(
            'project_views',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        )

        // Add foreign key for projectId
        await queryRunner.createForeignKey(
            'project_views',
            new TableForeignKey({
                columnNames: ['projectId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'projects',
                onDelete: 'CASCADE',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop project_views table (foreign keys will be dropped automatically)
        await queryRunner.dropTable('project_views')

        // Drop viewCount column from projects table
        await queryRunner.dropColumn('projects', 'viewCount')
    }
}
