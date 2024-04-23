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
const closeSpanWithAttribute = async (page) => {
  await page.evaluate(() => {
    // Find all <p> elements
    const paragraphs = document.querySelectorAll("p");

    // Loop through each <p> element
    paragraphs.forEach((paragraph) => {
      // Find all <span> elements inside the current <p> element
      const spans = paragraph.querySelectorAll("span");

      // Loop through each <span> element
      spans.forEach((span) => {
        // Check if the <span> element has the attribute data-lexical-text="true"
        if (span.getAttribute("data-lexical-text") === "true") {
          // Close the <span> element
          // span.click();
          console.log(span);
        }
      });
    });
  });
};

const clickReplyBtns = async (page, tagName, searchText) => {
  const totalCommentsArr = await page.evaluate(
    async (tagName, searchText) => {
      const comments = [];
      const paragraphs = document.querySelectorAll("p");
      const elements = document.querySelectorAll(tagName);
      const searchAndClickBackBtn = async () => {
        let matchFound = false; // Flag to track if a match is found

        // Continue looping until a match is found
        while (!matchFound) {
          // Select all <span> elements
          console.log("  // Continue looping until a match is found");
          const spans = document.querySelectorAll("span");

          // Loop through each <span> element
          spans.forEach((span) => {
            // Check if the text content of the span is "󰟙"
            if (span.textContent.trim() == "󰟙") {
              // Log the span to the console
              span.click();
              matchFound = true; // Set the flag to true to exit the loop
            }
          });

          // Wait for a brief moment before checking again (adjust this delay if needed)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      };
      try {
        if (elements && elements.length) {
          for (const element of elements) {
            if (element.innerText.trim() == searchText) {
              // element.click();
              comments.push(element);
            }

            // await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for x seconds
          }
        } else {
          throw new Error("Could not find elements with tag: " + searchText);
        }
        try {
          if (comments && comments.length) {
            comments[2].click();
            try {
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for x seconds
              let textArea = document.querySelector("textarea");
              if (textArea && textArea.value.length > 0) {
                textArea.value = "  Hello how are You today";
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for x seconds
                await searchAndClickBackBtn();
              } else {
                throw new Error("textArea Yet to open or does not exist");
              }
            } catch (e) {
              console.log(e.message);
            }
          } else {
            throw new Error("Comment array has not length or does not exist ");
          }
        } catch (e) {
          console.log(e.message);
        }
        console.log(comments);
      } catch (error) {
        console.log(error.message);
      }

      return comments;
    },
    tagName,
    searchText
  );

  console.log(totalCommentsArr.length);
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
    clickReplyBtns(page, "span", "Reply");
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
Start();
