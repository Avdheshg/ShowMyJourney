

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

    ** Holding Sorted PNR Details **
    1. Defin an array
    2. Define an object
    3. Define a key = Date + Time
        1. Add this key into the object
        2. Add this key into the array
    4. At the end, sort the array
    5. TR the array and save the details into the template

    ** Make a call for all PNR
    ** Replace strings with Pug
    ** Code cleanup
    ** Have correct file structure
    ** Implement API calling limit
    ** Have OAuth
    ** Save the previous entered PNRs until validation
    ** Look at the node-farm project and mimic
    ** 

*/

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
// for (let pnr of pnrList)
// {
//     console.log(pnr);  
// }


app.get("/pnr", async (req, res) => { 

    let allPNRDetailsOutput = "";
    for (let pnr of pnrList)
    {
        let currPNRdateTime;
        try 
        {

            let currentPNR = `${pnr}`; 

            // ** Call to the API for data  **
            // let responseData = await axios.request(`https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${currentPNR}`, options);       // type : object

            // let statusCode = responseData.status;
            // responseData = responseData.data.data;
            // console.log(response.data);

            // ** Calling custom API endpoint  **
            var responseData = await axios.request(`http://localhost:4000/${currentPNR}`, options);
            const statusCode = responseData.status;
            // console.log(typeof responseData.data.data); 
            responseData = responseData.data.data;

        
            if (statusCode === 200)
            {   
                // define a common variable which can be used to details of the current response for both API call and localhost call 
                
                currPNRdateTime = new Date(responseData.dateOfJourney);
                let currPNRDetailsObj;

                allJourneyDateTime.push(currPNRdateTime);
                
                // #region Fetching Details

                // Get the PNR

                // TRAIN DETAILS
                const trainName = responseData.trainName;
                const trainNumber = responseData.trainNumber;
                
                
                // ** JOURNEY DETAILS **   
                const dateOfJourney = responseData.dateOfJourney;  

                const sourceStation = responseData.sourceStation;

                const destinationStation = responseData.destinationStation;

                const bookingFare = responseData.bookingFare;

                const distance = responseData.distance;

                const journeyClass = responseData.journeyClass;
                const chartPrepared = responseData.chartStatus;

                // PASSENGER DETAILS
                const totalPassengers = responseData.numberOfpassenger;

                const passengerList = responseData.passengerList;

                // loop through array and print the individual passengers

                // console.log(passengerList[0]);

                for (var passenger of passengerList)
                {
                    const passengerSerialNumber = passenger.passengerSerialNumber;
                    const bookingStatusDetails = passenger.bookingStatusDetails;

                    // console.log(`${passengerSerialNumber}. ${bookingStatusDetails}`);
                } 

                
                currPNRDetailsObj = 
                {   
                    pnrNumber: responseData.pnrNumber,
                    trainName: trainName,
                    trainNumber: trainNumber,
                    dateOfJourney: dateOfJourney,
                    sourceStation: sourceStation,
                    destinationStation: destinationStation,
                    bookingFare: bookingFare,
                    distance: distance,
                    journeyClass: journeyClass,
                    chartPrepared: chartPrepared,
                    passengerList: passengerList
                }
                //#endregion

                currPNRdateTime = currPNRdateTime.toLocaleString(); 
                // console.log(typeof currPNRdateTime, currPNRdateTime)

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
            console.error(error.response);
        }

    }

    // V will create a template here
    // console.log("Printing the pnrDetailsObject\n", pnrDetailsObject);

    allJourneyDateTime.sort();

    // console.log(typeof allJourneyDateTime[0]);  
    let output;

    for (let currDateTime of allJourneyDateTime)
    {
        // console.log(`currDateTime: ${currDateTime}, curr PNR details: ${pnrDetailsObject[currDateTime.toLocaleString()].sourceStation}`);
        let currPNRDetails = pnrDetailsObject[currDateTime.toLocaleString()];
        // console.log(currPNRDetails);

        let pnrDetailsOutput = PNRDetailsLayout.replace(/{%DateOfJourney%}/g, currPNRDetails.dateOfJourney.toLocaleString());
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%PNRNumber%}/g, currPNRDetails.pnrNumber);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%TrainNumber%}/g, currPNRDetails.trainNumber);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%TrainName%}/g, currPNRDetails.trainName);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%SourceStation%}/g, currPNRDetails.sourceStation);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%DestinationStation%}/g, currPNRDetails.destinationStation);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%Distance%}/g, currPNRDetails.distance);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%BookingFare%}/g, currPNRDetails.bookingFare);         
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%JourneyClass%}/g, currPNRDetails.journeyClass);
        pnrDetailsOutput = pnrDetailsOutput.replace(/{%ChartPrepared%}/g, currPNRDetails.chartPrepared);

        let passengersList = currPNRDetails.passengerList;

        let tableRowStartIdx = BookingStatusTableLayout.indexOf("{%TableRowStart%}") + "{%TableRowStart%}".length;
        let tableRowEndIdx = BookingStatusTableLayout.indexOf("{%TableRowEnd%}")
        let tableRow = BookingStatusTableLayout.substring(tableRowStartIdx, tableRowEndIdx);
        let currentTableLayout = BookingStatusTableLayout;

        let tableRowsOutput = "";

        // ** Create serveral rows using tableRow, insert into a string which will hold all the rows, replace this common string with the tableRow


        for (let i = 0; i < passengersList.length; i++)
        {
            let tempRow = tableRow;
            tempRow = tempRow.replace(/{%SerialNumber%}/g, `${i+1}`);
            tempRow = tempRow.replace(/{%BookingStatus%}/g, passengersList[i].bookingStatusDetails);
            // console.log(tempRow);

            tableRowsOutput += tempRow;

            // let passengerBookingStatusOutput = BookingStatusTableLayout;
            // let passengerNumber = `${i+1}`;
            // let passengerBookingStatusDetails = passengersList[i].bookingStatusDetails;
            // // repalce the details from layout and save into passengerBookingStatusOutput
            // passengerBookingStatusOutput = passengerBookingStatusOutput.replace(/{%SerialNumber%}/g, passengerNumber);
            // passengerBookingStatusOutput = passengerBookingStatusOutput.replace(/{%BookingStatus%}/g, passengerBookingStatusDetails)

            // console.log(passengerBookingStatusOutput);

            
            // let table = document.createElement('table');
            // table.inserR
            // let td = table.insertRo

        }

        // updating the table layout so remove TableRowStart and TableRowEnd from the string
        tableRow = BookingStatusTableLayout.substring(tableRowStartIdx - "{%TableRowStart%}".length, tableRowEndIdx + "{%TableRowEnd%}".length); 
        // console.log(tableRowsOutput);
        currentTableLayout = currentTableLayout.replace(tableRow, tableRowsOutput);
        // console.log(currentTableLayout);

        pnrDetailsOutput = pnrDetailsOutput.replace(/{%BookingStatusTable%}/g, currentTableLayout);

        allPNRDetailsOutput += pnrDetailsOutput;
        /*
            Saving the passengers with a PNR

            1. Create a table template with heading and a row
            2. Read this template once at the top
            3. Loop through the passengers
                1. Define a new string, tableOutput, and replace s.no from the table template and save back into tableOutput
            4. Replace var TABLEOUTPUT from tableLayout.html
            5. Join the current output string with the main output string
            6. After iterating all the PNRs, replace output string with JOURNEY_CARDS  
        */

        // console.log(pnrDetailsOutput);
    }
    
    // console.log(allPNRDetailsOutput);
    
    JourneyOverviewLayout = JourneyOverviewLayout.replace(/{%JOURNEY_CARDS%}/g, allPNRDetailsOutput);

    fs.writeFileSync(`${__dirname}/Copy_JourneyOverviewLayout.html`, JourneyOverviewLayout);

    res.status(200).sendFile(`${__dirname}/Copy_JourneyOverviewLayout.html`);

    // ** Saving the PNR details into the file ** 
    // if (pnrDetails.length > 0)
    // {
    //     try 
    //     {
    //         fs.writeFileSync(`${__dirname}/pnrDetails.json`, JSON.stringify(pnrDetails));
    //         console.log("file written successfully!")
    //     }
    //     catch (err)
    //     {
    //         console.log(err); 
    //     }
    // }
})


const port = 3000;
app.listen(port, () => {
    console.log("Server is running on the port 3000");
})

// server.listen(3000, () => {
//     console.log('Server listening on port 3000');
// });

   















