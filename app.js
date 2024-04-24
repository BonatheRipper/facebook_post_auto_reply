require("fix-esm").register();
const puppeteer = require("puppeteer");
const { KnownDevices } = require("puppeteer");
const fs = require("fs");
const config = require("./config.json");
const cookies = require("./cookies.json");
const { currentLinks, homePage, LoginPage } = require("./links.js");
const {
  commentsSorter,
  prevCommentLoop,
  searchAndClickBackBtn,
  clickReplyBtns,
} = require("./utils.js");

const mobileDevice = KnownDevices["iPhone 13 Pro Max"];
const {
  scrollPageToBottom,
  scrollPageToTop,
} = require("puppeteer-autoscroll-down");
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const toLink = async (page, link) => {
  await page.goto(link, {
    waitUntil: "networkidle2",
  });
};
// Function to scroll to the bottom of the page
const pageScrollSpeed = {
  size: 500,
  delay: 250,
};

const openAllComments = async (page, tagName, searchText) => {
  // Sort comments
  await commentsSorter(page, "Newest");
  await sleep(10000);

  // Call the previous CommentLoop function
  await prevCommentLoop(
    page,
    tagName,
    searchText,
    scrollPageToBottom,
    scrollPageToTop,
    pageScrollSpeed,
    sleep
  );
};

// Defining a function to scroll to the bottom of the page

const Start = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    // defaultViewport: null,
  });
  const page = await browser.newPage();

  //   Check if we previouly have a saved session
  if (Object.keys(cookies).length) {
    // set the saved cookies in puppeteer broser page
    await page.setCookie(...cookies);
    // goto new  facebook  url

    // await toLink(page, homePage);
    // await sleep(2000);
    //emulate mobileDevice
    await page.emulate(mobileDevice);
    await toLink(page, currentLinks[0]);

    await sleep(5000);
    await openAllComments(page, "span", "Show previous comments");

    await sleep(5000);
    // clickReplyBtns(page, "span", "Reply");
    await clickReplyBtns(page, "span", "Reply");
    await sleep(400000);

    await browser.close();
  } else {
    // goto login page
    await page.goto(LoginPage, {
      waitUntil: "networkidle2",
    });
    // write in the username and password

    await page.type("#email", config.username, { delay: 50 });
    await page.type("#pass", config.password, { delay: 500 });

    // click the login button
    await page.click("#loginbutton");

    //wait for navigation to finsh
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await sleep(15000);
    // checked if logged in
    try {
      const exists = await page.$("h1::-p-text(Friends)");

      if (exists) {
        console.log("YES IT EXIST");
      } else {
        console.log("IT DOES NOT EXIST");
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
};
// Start();
