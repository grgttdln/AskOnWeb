chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "askQuestion") {
    chrome.storage.local.get(["tempSelections"], (result) => {
      let selections = result.tempSelections || [];

      if (message.text && !selections.includes(message.text)) {
        selections.push(message.text);

        chrome.storage.local.set(
          {
            tempSelections: selections,
            tempTimestamp: Date.now(),
          },
          () => {
            chrome.action.openPopup();
          }
        );
      } else {
        chrome.action.openPopup();
      }
    });
  } else if (message.action === "addToContext") {
    chrome.storage.local.get(
      ["contextStack", "persistedSelections"],
      (result) => {
        // Handle contextStack
        let contextItems = result.contextStack || [];

        // Add the new selection to the context
        if (message.text) {
          const newContextItem = {
            text: message.text,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            highlightId: message.highlightId || null,
          };

          contextItems.push(newContextItem);

          // Update contextStack
          chrome.storage.local.set({
            contextStack: contextItems,
            lastUpdated: Date.now(),
          });

          let selections = result.persistedSelections || [];
          selections.push(message.text);

          chrome.storage.local.set(
            {
              persistedSelections: selections,
              persistedTimestamp: Date.now(),
            },
            () => {
              const truncatedText =
                message.text.length > 30
                  ? message.text.substring(0, 30) + "..."
                  : message.text;

              // Show a notification that text was added to context
              chrome.notifications.create({
                type: "basic",
                iconUrl: "public/logo.png",
                title: "Added to Context Stack",
                message: `"${truncatedText}" was added to your context stack. You now have ${contextItems.length} items in context.`,
                priority: 0,
              });

              // Notify any open popup to refresh its data
              chrome.runtime.sendMessage({
                action: "selectionAdded",
                selection: newContextItem,
              });
            }
          );
        }
      }
    );
  } else if (message.action === "addQuery") {
    // Store the query in queryStack
    chrome.storage.local.get(["queryStack"], (result) => {
      let queries = result.queryStack || [];

      if (message.text) {
        const newQuery = {
          text: message.text,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
        };

        queries.push(newQuery);

        chrome.storage.local.set(
          {
            queryStack: queries,
            lastUpdated: Date.now(),
          },
          () => {
            // Notify any open popup to refresh its data
            chrome.runtime.sendMessage({
              action: "queryAdded",
              query: newQuery,
            });
          }
        );
      }
    });
  }

  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(() => {
      console.log("Popup disconnected");
    });
  }
});
