const puppeteer = require("puppeteer");
const fs = require("fs");
const config = require("./config.json");
const cookies = require("./cookies.json");
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  //   Check if we previouly have a saved session
  if (Object.keys(cookies).length) {
    // set the saved cookies in puppeteer broser page
    await page.setCookies(...cookies);
    // goto facebook
    await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2" });
  } else {
    // goto login page
    await page.goto("https://www.facebook.com/login", {
      waitUntil: "networkidle2",
    });
    // write in the username and password

    await page.type("#email", config.username, { delay: 50 });
    await page.type("#pass", config.password, { delay: 500 });

    // click the login button
    await page.click("#loginbutton");

    //wait for navigation to finsh
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await sleep(60000);
    // checked if logged in
    try {
      const exists = await page.$("h1::-p-text(Friends)");

      if (exists) {
        console.log("YES IT EXIST");
      }
    } catch (error) {
      console.log({ 1: "Failed to login", 2: error });
      process.exit(0);
    }
    // get the current browser pages session
    let currentCookies = await page.cookies();
    console.log("trying to write cookies");
    // create a cookie file if not already created to hold the session
    fs.writeFileSync("./cookies.json", JSON.stringify(currentCookies));
  }
  debugger;
})();
