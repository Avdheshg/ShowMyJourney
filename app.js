
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const { hostname, type } = require("os");
const axios = require("axios");

const app = express();

const options = {
    headers: {
        'x-rapidapi-key': 'b72294afa3msh7382f0e6fd3b2acp146e49jsn9f3792d24b5b',
    }
}

// *** Reading the files   *** 
let pnrList = fs.readFileSync(`${__dirname}/PNR.txt`, "utf-8");
pnrList = pnrList.split(","); 

let PNRDetailsLayout = fs.readFileSync(`${__dirname}/PNRDetailsLayout.html`, "utf-8");
// console.log(PNRDetailsLayout);

let BookingStatusTableLayout = fs.readFileSync(`${__dirname}/bookingStatusTableLayout.html`, "utf-8")
// console.log(BookingStatusTableLayout);

let JourneyOverviewLayout = fs.readFileSync(`${__dirname}/journeyOverview.html`, "utf-8");
// console.log(JourneyOverviewLayout);

let allJourneyDateTime = []; 
let pnrDetailsObject = {}; 
let errorResponse = "";

async function CallAPI(currentPNR)
{
    let responseData = await axios.request(`https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${currentPNR}`, options);       // type : object

    let statusCode = responseData.status;
    responseData = responseData.data.data;
    console.log(typeof responseData); 

    return [statusCode, responseData];
}

async function CallLocalhost(currentPNR)
{
    let responseData = await axios.request(`http://localhost:4000/${currentPNR}`, options);
    const statusCode = responseData.status;
    responseData = responseData.data.data;

    return [statusCode, responseData];
}

app.get("/pnr", async (req, res) => { 

    let allPNRDetailsOutput = "";
    let AllJsonPnrResponse = [];
    let count = 1;

    for (let pnr of pnrList)
    {
        let currPNRdateTime;
        try 
        {

            // if (count == 2)
            // {
            //     break;   // create an array for the responseDate we will receive from the API call(1 PNR. it's giving 1 data. V need to save these JSON data into an array and then save it into the file for future use).
            //     // return res.status(200).send("<h1>1 Reuqests made</h1>");
            // }
            // count++;

            
            let currentPNR = `${pnr}`; 
            
            // const [statusCode, responseData] = await CallAPI(currentPNR);

            const [statusCode, responseData] = await CallLocalhost(currentPNR);

            AllJsonPnrResponse.push(responseData);

            if (statusCode === 200)
            {                   
                currPNRdateTime = new Date(responseData.dateOfJourney);
                let currPNRDetailsObj;

                allJourneyDateTime.push(currPNRdateTime);
                
                // #region Fetching Details

                currPNRDetailsObj = 
                {   
                    pnrNumber: responseData.pnrNumber,
                    trainName: responseData.trainName,
                    trainNumber: responseData.trainNumber,
                    dateOfJourney: responseData.dateOfJourney,
                    sourceStation: responseData.sourceStation,
                    destinationStation: responseData.destinationStation,
                    bookingFare: responseData.bookingFare,
                    distance: responseData.distance,
                    journeyClass: responseData.journeyClass,
                    chartPrepared: responseData.chartStatus,
                    passengerList: responseData.passengerList
                }
                //#endregion

                currPNRdateTime = currPNRdateTime.toLocaleString(); 

                pnrDetailsObject[currPNRdateTime] = currPNRDetailsObj;

            }
            else if (statusCode === "429")
            {
                // console.error(error.message);    
            }
            else 
            {

            }

        }
        catch (error)
        {
            errorResponse += `${error}\n\n\n\n`;
            // console.error("error");
        }

    } 

    allJourneyDateTime.sort();    

    let previousDate = new Date("11/17/2023, 7:35:50 PM");
  
    for (let currDateTime of allJourneyDateTime)
    {   
        // console.log(`currDateTime: ${currDateTime}, curr PNR details: ${pnrDetailsObject[currDateTime.toLocaleString()].sourceStation}`);
        let currPNRDetails = pnrDetailsObject[currDateTime.toLocaleString()];
 
        let stringToReplace = ["DateOfJourney", "PNRNumber", "TrainNumber", "TrainName", "SourceStation", "DestinationStation", "Distance", "BookingFare", "JourneyClass", "ChartPrepared"]

        let replacingData = [currPNRDetails.dateOfJourney.toLocaleString(), currPNRDetails.pnrNumber, currPNRDetails.trainNumber, currPNRDetails.trainName, currPNRDetails.sourceStation, currPNRDetails.destinationStation, currPNRDetails.distance, currPNRDetails.bookingFare, currPNRDetails.journeyClass, currPNRDetails.chartPrepared];

        // console.log(typeof `/{%DateOfJourney%}/g`)

        let pnrDetailsOutput = PNRDetailsLayout; 
        for (let i = 0; i < stringToReplace.length; i++)
        {
            pnrDetailsOutput = ReplaceString(pnrDetailsOutput, new RegExp(`{%${stringToReplace[i]}%}`, "g"), replacingData[i]);
        }

        // let cDate = currDateTime.toDateString();
        // let pDate = previousDate.toDateString();
        // console.log(`currDateTime.toDateString() > previousDate.toDateString(): ${currDateTime.toDateString() > previousDate.toDateString()}`); 
  
        if (currDateTime.toDateString() > previousDate.toDateString())
        {
            
        }
        if (currDateTime.toDateString() === previousDate.toDateString()) 
        {
            pnrDetailsOutput = ReplaceString(pnrDetailsOutput, new RegExp(`{%isSameDate%}`, "g"), "sameDate");
            
        }
        previousDate = currDateTime;

        let passengersList = currPNRDetails.passengerList;

        let tableRowStartIdx = BookingStatusTableLayout.indexOf("{%TableRowStart%}") + "{%TableRowStart%}".length;
        let tableRowEndIdx = BookingStatusTableLayout.indexOf("{%TableRowEnd%}")
        let tableRow = BookingStatusTableLayout.substring(tableRowStartIdx, tableRowEndIdx);
        let currentTableLayout = BookingStatusTableLayout;

        let tableRowsOutput = ""; 

        for (let i = 0; i < passengersList.length; i++)   
        { 
            let tempRow = tableRow;
            tempRow = ReplaceString(tempRow, new RegExp(`{%SerialNumber%}`, "g"), `${i+1}`)
            tempRow = ReplaceString(tempRow, new RegExp(`{%BookingStatus%}`, "g"), passengersList[i].bookingStatusDetails)

            tableRowsOutput += tempRow;
        }

        // updating the table layout so remove TableRowStart and TableRowEnd from the string
        tableRow = BookingStatusTableLayout.substring(tableRowStartIdx - "{%TableRowStart%}".length, tableRowEndIdx + "{%TableRowEnd%}".length); 
        currentTableLayout = currentTableLayout.replace(tableRow, tableRowsOutput);

        // pnrDetailsOutput = pnrDetailsOutput.replace(/{%BookingStatusTable%}/g, currentTableLayout);
        pnrDetailsOutput = ReplaceString(pnrDetailsOutput, new RegExp("{%BookingStatusTable%}", "g"), currentTableLayout);

        allPNRDetailsOutput += pnrDetailsOutput;
    }
    
    

    JourneyOverviewLayout = ReplaceString(JourneyOverviewLayout, new RegExp("{%JOURNEY_CARDS%}", "g"), allPNRDetailsOutput);

    fs.writeFileSync(`${__dirname}/Copy_JourneyOverviewLayout.html`, JourneyOverviewLayout);

    // fs.writeFileSync(`${__dirname}/pnrDetails.json`, JSON.stringify(AllJsonPnrResponse));
    
    // SaveJSONIntoFile(`${__dirname}/pnrDetails.json`, responseData);

    if (errorResponse !== "")
    {   
        console.log(`${errorResponse}`)
        return res.status(400).send(`<h1>${errorResponse}</h1>`)
    }

    return res.status(200).sendFile(`${__dirname}/Copy_JourneyOverviewLayout.html`);

})


function ReplaceString(template, toReplaceString, data)
{
    let temp = template.replace(toReplaceString, data);
    // console.log(temp);
    return temp;
}

function SaveJSONIntoFile(filePath, data)
{
    if (data.length > 0)
    {
        try 
        {   
            fs.writeFileSync(filePath,"");
            fs.writeFileSync(filePath, JSON.stringify(data));
            console.log("file written successfully!")
        }
        catch (err)
        {
            console.log(err); 
        }
    }
}

 
const port = 3000;
app.listen(port, () => {
    console.log("Server is running on the port 3000");
})



  




/**
 * Another API: https://rapidapi.com/shivesh96/api/real-time-pnr-status-api-for-indian-railways/pricing    100/Month
 
    Current API: 
    Current: Able to make the request to news API
             
    1. Create another server with 2 end points:
        - Success : 
        - Failure

    2. In the current project, consume that API 
    3. At the end, Call the real api

Replacing the HTML text with JSON
    1. Define a card and overview template
    2. TR the JSON data and fill each JSON into the card
    3. Save all the cards into a variable, "cards"
    4. Fill "cards" into the overview template
    
For this project, V need to sort the data according to the 
    1. Dates : If >1 PNRs are on the same date, then they will be shown under the same bar
    2. Train : if same date, and if they also fall in the same train, then they will be shown under the same bar

    Cases:
        1. Same Date
            1. Same Train
            2. Different Train
        2. Different Date:
            1. Same train
            2. Different train


    https://rapidapi.com/dev2919/api/pnr-status-indian-railway/playground/apiendpoint_724b50aa-fe2d-4b24-8037-93d29cf93b2d


    Parts:
        1. Send a successfull request from postman
            * Understand the basics of what U R using while sending the request
        2. Send a successful request from node for 1 PNR


        3. Send Multiple requests using Loop
            Read the PNR from the file
            Get PNR details for making a call for that PNR
                1. V only call for those PNRs who are not saved in our system. This could be based on when we last updated out PNR
                2. save the data into a file
                    1. Create an array of JSON
                    2. For each request, save the current JSON for the current PNR into the array
                    3. Save the array into the file

        4. Design the frontend part

    * For each day, V will only make one time PNR calls to the API 
        We will hold the status into DB and stop the further call to the API for the rest of the day

    ** 1 date for 1 date PNRs => Alternate date, different color  
    ** Make a call for all PNR
    ** Count of total calls made for an API
    ** Have better variable names
    ** Replace saving into file with Mongo  
    ** Save the previous entered PNRs until validation
    ** Replace strings with Pug
    ** Code cleanup
    ** Have correct file structure  
    ** Implement API calling limit   
    ** Once we have received CNF for a PNR, we can propmpt the user, if he still wants to send the request for these PNRs   
    ** Have OAuth
    ** Add logger
    ** 
    ** 

    ** Features **
    * Will change the BG on date change
    * Create own API to deliver data




*/
 
 





