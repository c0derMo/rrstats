const fs = require('fs/promises');

const renderBackendPage = async (page, title) => {
    var layout = await fs.readFile(__dirname + "/html/backend/layout.html", 'utf-8');

    layout = layout.replace("{{title}}", title);

    for ( const e of ['customHead', 'contentPreHeader', 'content', 'contentPostContainer', 'script']) {
        try {
            const tmp = await fs.readFile(__dirname + "/html/backend/" + page + "/" + e + ".html", 'utf-8');
            layout = layout.replace("{{" + e + "}}", tmp);
        } catch {
            layout = layout.replace("{{" + e + "}}", "");
        }
    }

    return layout;
}

export { renderBackendPage };