
const express = require("express");
const fs = require("fs");

const app = express();

const allPNRDetails = JSON.parse(fs.readFileSync(`${__dirname}/responseSuccess.json`, 'utf-8'));
// console.log(allPNRDetails.length)

// console.log(successJSONData)

app.get("/:pnr", (req, res) => {
    // let res;

    //  get the PNR number from the url and send it as a single respnse
    let pnr = req.params;

    for (var currPNRDetails of allPNRDetails)
    {
        if (currPNRDetails != null && currPNRDetails.pnrNumber == pnr.pnr)
        {
            return res.status(200).json({
                data: currPNRDetails
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

/*

//*[local-name() = 'div'][contains(@data-aura-class,'navexDesktopLayoutContainer') and contains(@data-aura-class,'lafAppLayoutHost') and contains(@data-aura-class,'forceAccess') and contains(@data-aura-class,'forceStyle') and contains(@data-aura-class,'oneOne') and contains(@class,'desktop') and contains(@class,'container') and contains(@class,'forceStyle') and contains(@class,'oneOne') and contains(@class,'navexDesktopLayoutContainer') and contains(@class,'lafAppLayoutHost') and contains(@class,'forceAccess')]

/*[local-name() = 'div'][@class='viewport']

//*[local-name() = 'div'][@data-aura-class='navexStandardManager']

/*[local-name() = 'div'][contains(@class,'fullheight') and contains(@class,'center') and contains(@class,'oneCenterStage') and contains(@class,'mainContentMark')]

/*[local-name() = 'div'][contains(@class,'maincontent')]

/*[local-name() = 'div'][contains(@class,'contentArea') and contains(@class,'fullheight')]



//*[local-name() = 'one-record-home-flexipage2']

//*[local-name() = 'forcegenerated-adg-rollup_component___force-generated__flexipage_-record-page___sfa__-contact_rec_-l___-contact___-v-i-e-w___-l-m-t___-v-i-e-w']

//*[local-name() = 'forcegenerated-flexipage_contact_rec_l_contact__view_js___lmt___1731662642000']

//*[local-name() = 'div'][@class='record-page-decorator']

//*[local-name() = 'div'][contains(@class,'slds-grid') and contains(@class,'slds-wrap') and contains(@class,'slds-col') and contains(@class,'slds-size_1-of-1') and contains(@class,'row') and contains(@class,'row-main')]

/*[local-name() = 'div'][contains(@class,'column') and contains(@class,'slds-size_1-of-1') and contains(@class,'slds-medium-size_4-of-12') and contains(@class,'slds-large-size_4-of-12') and contains(@class,'region-sidebar-right')]

//*[local-name() = 'flexipage-tab2'][@role='tabpanel' and @aria-labelledby='activityTab__item']

//*[local-name() = 'flexipage-aura-wrapper']

//*[local-name() = 'runtime_sales_activities-activity-panel-composer']        // last parent = This parent contains all the elements

/*[local-name() = 'lightning-button-group'][contains(@class,'slds-m-vertical_xxx-small') and contains(@class,'slds-button-group')]

/*[local-name() = 'div'][@class='fix_button-group-flexbox']

//*[local-name() = 'button'][@title='Log a Call']


Activity Publisher
New Task
No Additional New Task Actions
Log a Call
More Log a Call Actions
New Event
More New Event Actions
Email
More Email Actions
Activity Timeline
Skip to the bottom of the activity timeline
Filters: All time • All activities • All types
Timeline Settings
Refresh
•
Expand All
•
View All
Upcoming & Overdue
No activities to show.
Get started by sending an email, scheduling a task, and more.
No past activity. Past meetings and tasks marked as done show up here.
Skip to the top of the activity timeline



*/


