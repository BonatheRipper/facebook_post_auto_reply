const commentsSorter = async (page, sortByText) => {
  await page.evaluate(async (sortByText) => {
    function clickOkButton() {
      // Find all <div> elements with the specified attributes
      const divsWithAttribute = document.querySelectorAll(
        'div[role="button"][aria-label="OK"]'
      );

      // Loop through each matching <div> element
      divsWithAttribute.forEach((div) => {
        // Check if the textContent of the <div> matches "OK"
        if (div.textContent.trim() == "OK") {
          // Perform actions on the matching <div> element
          div.click();
        }
      });
    }

    const mostRelevantSearch = document.querySelectorAll("div.native-text");
    for (const element of mostRelevantSearch) {
      if (element.innerText.trim() === "Most relevant") {
        element.click();
        // Wait for a brief moment for the div to open (adjust this delay if needed)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Now click the second element inside the opened div
        function clickSortedText() {
          // Find all <div> elements with the specified attributes
          const divsWithAttributes = document.querySelectorAll(
            'div[role="radio"][tabindex="0"][aria-checked="false"][data-focusable="true"][data-tti-phase="-1"]'
          );

          // Loop through each matching <div> element
          divsWithAttributes.forEach((div) => {
            // Find the <h3> tag child inside the current <div>
            const h3Child = div.querySelector("h3");

            // Check if the <h3> tag child exists and its text content is "sortByText"
            if (h3Child && h3Child.textContent.trim() == sortByText) {
              // Click the <h3> tag child
              h3Child.click();
            }
          });
        }

        // Call the function to start clicking
        clickSortedText();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Call the function to start looping through the <div> elements
        clickOkButton();
      }
    }
  }, sortByText);
};

const prevCommentLoop = async (
  page,
  tagName,
  searchText,
  scrollPageToBottom,
  scrollPageToTop,
  pageScrollSpeed,
  sleep
) => {
  let matchedTexts;
  do {
    // Click elements with the specified text
    matchedTexts = await page.evaluate(
      (tagName, searchText) => {
        const matchedTexts = [];
        const elements = document.querySelectorAll(tagName);
        elements.forEach((element) => {
          if (element.innerText.trim() === searchText) {
            element.click();
            matchedTexts.push(searchText);
          }
        });
        return matchedTexts;
      },
      tagName,
      searchText
    );

    // If matchedTexts array is not empty, log and scroll down
    if (matchedTexts.length > 0) {
      console.log(matchedTexts);
      await sleep(4000);
      await scrollPageToBottom(page, pageScrollSpeed);
    }
  } while (matchedTexts.length > 0); // Continue looping as long as matchedTexts is not empty

  // Log a message indicating that the loop has stopped
  console.log(
    "Loop has stopped because no more elements with the specified text were found."
  );
  await scrollPageToTop(page, pageScrollSpeed);
  // await commentsCounter(page, "div", "Reply");
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
      const elements = document.querySelectorAll(tagName);
      //SEARCH N CICK
      const searchAndClickBackBtn = async (elementTag, condition) => {
        let matchFound = false; // Flag to track if a match is found

        // Continue looping until a match is found
        while (!matchFound) {
          // Select all <span> elements
          console.log("  // Continue looping until a match is found");
          const spans = document.querySelectorAll(elementTag);

          // Loop through each <span> element
          spans.forEach((span) => {
            // Check if the text content of the span is "󰟙"
            if (span.textContent.trim() == condition) {
              // Log the span to the console
              span.click();
              matchFound = true; // Set the flag to true to exit the loop
            }
          });

          // Wait for a brief moment before checking again (adjust this delay if needed)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      };
      const searchAndClickSend = async (sendDivType) => {
        let sendDivFound = false;

        while (!sendDivFound) {
          // Check if the div with aria-label="SEND" is found
          const sendDiv = document.querySelector(sendDivType);

          // If the SEND div is found, set sendDivFound to true and break out of the loop
          if (sendDiv) {
            sendDivFound = true;
            sendDiv.click();
            break;
          }

          // If the SEND div is not found, wait for a brief moment before searching again
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second (adjust as needed)
        }

        // Once the SEND div is found, you can perform further actions here
      };
      const replySendGoBack = async (
        totalCommentCustom,
        commentsArray,
        whatToReply
      ) => {
        for (i = 0; i < totalCommentCustom; i++) {
          commentsArray[i].click();
          try {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for x seconds

            let textArea = document.querySelector("textarea");
            if (textArea && textArea.value.length > 0) {
              textArea.value = `${whatToReply} ${i}`;
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for x seconds
              await searchAndClickSend('div[aria-label="SEND"]');
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for x seconds

              await searchAndClickBackBtn("span", "󰟙");
            } else {
              throw new Error("textArea Yet to open or does not exist");
            }
          } catch (e) {
            console.log(e.message);
          }
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
            // Loop through all saved comments in the arrray then start replying;

            replySendGoBack(2, comments, " Hello how are you: ");
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

module.exports = { commentsSorter, prevCommentLoop, clickReplyBtns };
