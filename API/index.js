
const express = require("express");
const fs = require("fs");

const app = express();

const allPNRDetails = JSON.parse(fs.readFileSync(`${__dirname}/responseSuccess.json`, 'utf-8'));

// console.log(successJSONData)

app.get("/:pnr", (req, res) => {
    // let res;

    //  get the PNR number from the url and send it as a single respnse
    let pnr = req.params;

    for (var currPNR of allPNRDetails)
    {
        if (currPNR.pnrNumber == pnr.pnr)
        {
            return res.status(200).json({
                data: currPNR
            });
        }
    }

    res.status(204).json({
        message: "No details for this PNR"
    });
})

app.get("/fail/8519634518", (req, res) => {
    res.json(FailureJSONData);   
})
   


app.listen(4000, () => {
    console.log(`Server is running on the port 4000`);
})

