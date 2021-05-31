const gDriveObjectToMatchlist = require('./gDriveIntegration');
// @ts-ignore
const readline = require("readline");
// @ts-ignore
const axios = require("axios");
// @ts-ignore
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


console.log("Spreadsheet to JSON matchlist converter");
console.log("v0.1 by c0derMo");
console.log("")
console.log("Please only use for finished competitions!");
console.log("");

rl.question("Please enter the ID of the spreadsheet: ", sID => {
    rl.question("Please enter the number of the sheet: ", tabID => {
        rl.question("Please enter the competition string: ", comp => {
            rl.question("Please enter the column assignment: (Leave blank for default)", cA => {
                console.log("Querying JSON data from google...");
                axios.get("https://spreadsheets.google.com/feeds/cells/" + sID + "/" + tabID + "/public/values?alt=json-in-script").then((d) => {
                    console.log("Parsing google response...");
                    let fancyData;
                    if(cA == "") {
                        console.log("Default column assignment will be used.");
                        fancyData = gDriveObjectToMatchlist(JSON.parse(d.data.substring(28, d.data.length-2)), comp, true);
                    } else {
                        console.log("Column assignment: " + cA);
                        fancyData = gDriveObjectToMatchlist(JSON.parse(d.data.substring(28, d.data.length-2)), comp, true, JSON.parse(cA));
                    }
                    console.log("Writing parsed matchlist to " + comp + ".json...");
                    fs.writeFile(comp + ".json", JSON.stringify(fancyData), (err) => {
                        if(err) console.log(err);
                        console.log("");
                        console.log("Done!");
                        rl.close();
                    });
                });    
            });
        });
    });
});