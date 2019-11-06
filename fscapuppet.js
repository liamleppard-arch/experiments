const puppeteer = require('puppeteer');

// TODO: Break this functon up
//Main function that takes an FSP Number as its input and returns the detail on the FSP
let fscaScrape = async (fspNumber) => {
    //Configure browser and go to search page
    //TODO: remove headless when moving to production
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.fsca.co.za/Fais/Search_FSP.htm');
    //Find and enter the FSP number
    await page.focus('body > form > center > table:nth-child(6) > tbody > tr:nth-child(1) > td:nth-child(2) > input');
    //Fill in the FSP number on the form and wait for the result
    await page.$eval('body > form > center > table:nth-child(6) > tbody > tr:nth-child(1) > td:nth-child(2) > input', (el, value) => el.value = value, fspNumber);
    await page.click('body > form > center > input[type=submit]:nth-child(14)');
    await page.waitFor(1000);

    //Scrape the FSP listing page
    //TODO: Error Handling on no result
    const listingResult = await page.evaluate(() => {
        let fspName = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2)').innerText;
        let finYearEnd = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4)').innerText;
        let fscaStatus = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(5)').innerText;
        return {
            fspName,
            finYearEnd,
            fscaStatus
        }    
    });

    // Go to detail page and wait for result
    await page.click('body > form > center > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(10) > input[type=submit]');
    await page.waitFor(1000);

    //Scrape the detail page
    const detailResult = await page.evaluate(() => {
        let fspType = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(3) > td.noborderText').innerText;
        let companyRegistration = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(4) > td.noborderText').innerText;
        let dateAuthorised = document.querySelector('body > form > center > table:nth-child(3) > tbody > tr:nth-child(5) > td.noborderText').innerText;
        let physicalAddress = document.querySelector('#Contact_Info > table > tbody > tr:nth-child(1) > td.noborderText').innerText;
        let telephoneNumber = document.querySelector('#Contact_Info > table > tbody > tr:nth-child(2) > td.noborderText').innerText;
        let contactPerson = document.querySelector('#Contact_Info > table > tbody > tr:nth-child(3) > td.noborderText').innerText;
        let contactTelNo = document.querySelector('#Contact_Info > table > tbody > tr:nth-child(4) > td.noborderText').innerText;
        //DONE?: Compliance officers Table (works but messy)
        let complianceOfficerData = [];
        let tableElement = document.querySelector('#ComplianceOfficers > table > tbody');
        var i;
        for (i=2; i<tableElement.childNodes.length; i++) {
            if (i%2==0) { //Compliance Officer Name
                complianceOfficerData.push(tableElement.childNodes[i].innerText);
                //TODO: Work out why its extracting both name and telephone number in this call
            } else { //Compliance Officer Phone Number

            }

        }
        //TODO: Key Individuals
        //TODO: Products Approved
        return {
            fspType,
            companyRegistration,
            dateAuthorised,
            physicalAddress,
            telephoneNumber,
            contactPerson,
            contactTelNo,
            complianceOfficerData
        }    
    });

    /* REPRESENTATIVES */

    //TODO: Go to the reps page and extract all, going to new page when possible
    //await page.evaluate(() => searchReps()); 
    //await page.waitFor(3000);


    //Testing only: takes  screenshot of the last page it got to
    await page.waitFor(1000);
    await page.screenshot({path: 'page1.png'});

    //Close up
    browser.close();

    // Return the data

    console.log(listingResult);
    console.log(detailResult);
    return 'Script completed for FSP:'+fspNumber;
}

//Change the number to whichever fsp is to be queried
fscaScrape(100).then((value) => {
    console.log(value); 
});

