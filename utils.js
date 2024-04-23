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

module.exports = { commentsSorter, prevCommentLoop };
