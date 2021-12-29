Vue.component('rrstats-backend-sidebar', {
    data() {
        return {
            sidebar: false
        }
    },
    props: {
        title: {
            type: String,
            default: "RRStats backend"
        }
    },
    template: `
    <div>
    <v-app-bar>
        <v-app-bar-nav-icon @click="sidebar = true"></v-app-bar-nav-icon>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn href="/backend/user" text><v-icon left>mdi-account</v-icon>Profile</v-btn>
        <v-btn icon href="/backend/logout"><v-icon>mdi-logout-variant</v-icon></v-btn>
    </v-app-bar>
    <slot></slot>
    <v-navigation-drawer absolute temporary v-model="sidebar">
        <rrstats-backend-menulist :include-subtitle="false">
            <template v-slot:pre-list>
                <v-list-item two-line href="/backend">
                    <v-list-item-icon><v-icon>mdi-backburger</v-icon></v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>RRStats backend</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </rrstats-backend-menulist>
    </v-navigation-drawer>
    </div>
    `
})

Vue.component('rrstats-backend-menulist', {
    data() {
        return {
            menuItems: [{
                id: "matches",
                name: "Matches",
                description: "Lists all the matches.",
                icon: "mdi-book-edit-outline",
                href: "/backend/matches"
            },{
                id: "players",
                name: "Players",
                description: "Lists all the players.",
                icon: "mdi-account-edit-outline",
                href: "/backend/players"
            },{
                id: "comps",
                name: "Competitions",
                description: "Lists all the competitions.",
                icon: "mdi-format-list-bulleted",
                href: "/backend/competitions"
            },{
                id: "importSpreadsheet",
                name: "Import spreadsheet",
                description: "Imports a spreadsheet as a permanent part of the system.",
                icon: "mdi-database-import-outline",
                href: "/backend/importSpreadsheet"
            },{
                id: "importStandings",
                name: "Bulk import standings",
                description: "Import standings and adds them to the corresponding competition.",
                icon: "mdi-database-import-outline",
                href: "/backend/importStandings"
            },{
                id: "dbChecks",
                name: "Database checks",
                description: "Runs various checks on the database.",
                icon: "mdi-stethoscope",
                href: "/backend/databaseChecks"
            }, {
                id: "renamePlayer",
                name: "Rename player",
                description: "Renames a player across the database.",
                icon: "mdi-account-wrench-outline",
                href: "/backend/renamePlayer"
            },{
                id: "records",
                name: "Records",
                description: "Lists all records currently in the system.",
                icon: "mdi-medal-outline",
                href: "/backend/records"
            },{
                id: "log",
                name: "Audit logs",
                description: "Get a comprehensive log of all actions taken in the backend.",
                icon: "mdi-book-search-outline",
                href: "/backend/logs"
            },{
                id: 'tweet',
                name: 'Tweet',
                description: 'Tweet from the official @rrstats-Account',
                icon: 'mdi-twitter',
                href: '/backend/tweet'
            }]
        } 
    },
    props: {
        includeSubtitle: {
            type: Boolean,
            default: true
        }
    },
    template: `
    <v-list>
        <slot name="pre-list"></slot>
        <v-list-item two-line v-for="menuItem in menuItems" :key="menuItem.id" :href="menuItem.href">
            <v-list-item-icon><v-icon v-text="menuItem.icon"></v-icon></v-list-item-icon>
            <v-list-item-content>
                <v-list-item-title>{{ menuItem.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="includeSubtitle">{{ menuItem.description }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <slot name="post-list"></slot>
    </v-list>
    `
})