import {
    type MigrationInterface,
    type QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from "typeorm";

export class BracketAndAccoladeAddition1776851396630 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Accolade changes
        await queryRunner.query(
            `UPDATE player SET title = COALESCE(title, 'Returning Rival')`,
        );
        await queryRunner.changeColumn(
            "player",
            "title",
            new TableColumn({
                name: "defaultAccolade",
                type: "text",
                isNullable: false,
            }),
        );
        await queryRunner.addColumn(
            "player",
            new TableColumn({
                name: "accolade",
                type: "text",
                isNullable: true,
            }),
        );
        await queryRunner.query(`UPDATE player SET accolade = defaultAccolade`);
        await queryRunner.changeColumn(
            "player",
            "accolade",
            new TableColumn({
                name: "accolade",
                type: "text",
                isNullable: false,
            }),
        );
        await queryRunner.dropColumn("player", "hasCustomTitle");

        // Bracket stuff
        await queryRunner.createTable(
            new Table({
                name: "bracket",
                columns: [
                    new TableColumn({
                        name: "competition",
                        type: "text",
                        isPrimary: true,
                    }),
                    new TableColumn({
                        name: "index",
                        type: "int8",
                        isPrimary: true,
                    }),
                    new TableColumn({
                        name: "name",
                        type: "text",
                    }),
                    new TableColumn({
                        name: "advancementBracket",
                        type: "boolean",
                    }),
                    new TableColumn({
                        name: "rounds",
                        type: "text",
                    }),
                    new TableColumn({
                        name: "forfeits",
                        type: "text",
                    }),
                ],
            }),
            true,
        );
        await queryRunner.createIndex(
            "bracket",
            new TableIndex({
                columnNames: ["name"],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Accolade changes
        await queryRunner.changeColumn(
            "player",
            "defaultAccolade",
            new TableColumn({
                name: "title",
                type: "text",
                isNullable: true,
            }),
        );
        await queryRunner.dropColumn("player", "accolade");
        await queryRunner.addColumn(
            "player",
            new TableColumn({
                name: "hasCustomTitle",
                type: "boolean",
                isNullable: true,
            }),
        );

        // Bracket stuff
        await queryRunner.dropTable("bracket", true, false, true);
    }
}
