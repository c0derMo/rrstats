import CSVExportController from "~~/server/controller/CSVExportController";

export default defineEventHandler(async (event) => {
    const query = getQuery<{
        player?: string;
        competitions?: string | string[];
    }>(event);

    if (query.player == null && query.competitions == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "player must not be null",
        });
    }

    let csv;
    let filename = "matches.csv";
    if (query.player != null) {
        csv = CSVExportController.exportPlayersMatches(query.player);
    } else if (query.competitions != null) {
        if (typeof query.competitions === "object") {
            csv = CSVExportController.exportCompetitionMatches(
                query.competitions,
            );
            if (query.competitions.length <= 3) {
                filename = `${query.competitions.join("-")}.csv`;
            }
        } else {
            csv = CSVExportController.exportCompetitionMatches([
                query.competitions,
            ]);
            filename = `${query.competitions}.csv`;
        }
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "player or competitions must not be null",
        });
    }

    setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename=${filename}`,
    );

    return csv;
});
