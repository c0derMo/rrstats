import {
    TableColumn,
    type MigrationInterface,
    type QueryRunner,
} from "typeorm";

export class RenameLiveTournamentToggle1788438600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename toggle
        await queryRunner.changeColumn(
            "competition",
            "updateWithHitmaps",
            new TableColumn({
                name: "liveCompetition",
                type: "boolean",
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rename toggle
        await queryRunner.changeColumn(
            "competition",
            "liveCompetition",
            new TableColumn({
                name: "updateWithHitmaps",
                type: "boolean",
                isNullable: true,
            }),
        );
    }
}
