import { writable } from "svelte/store";

// Create a store for context stack (selections)
function createContextStackStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    // Add a new context item
    add: (text, highlightId = null) => {
      if (!text || !text.trim()) return;

      const contextItem = {
        text: text.trim(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        highlightId: highlightId,
      };

      update((items) => {
        // Check if this item already exists to avoid duplicates
        const exists = items.some((item) => item.text === contextItem.text);

        if (exists) return items;

        const updatedItems = [...items, contextItem];

        // Save to chrome.storage.local
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({
            contextStack: updatedItems,
            lastUpdated: Date.now(),
          });

          // Also update persistedSelections for backward compatibility
          chrome.storage.local.set({
            persistedSelections: updatedItems.map((s) => s.text),
            persistedTimestamp: Date.now(),
          });
        }

        return updatedItems;
      });
    },

    // Add to context stack without checking for duplicates
    addWithDuplicates: (text, highlightId = null) => {
      if (!text || !text.trim()) return;

      const contextItem = {
        text: text.trim(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        highlightId: highlightId,
      };

      update((items) => {
        const updatedItems = [...items, contextItem];

        // Save to chrome.storage.local
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({
            contextStack: updatedItems,
            lastUpdated: Date.now(),
          });

          // Also update persistedSelections for backward compatibility
          chrome.storage.local.set({
            persistedSelections: updatedItems.map((s) => s.text),
            persistedTimestamp: Date.now(),
          });
        }

        return updatedItems;
      });
    },

    // Remove a context item by index
    remove: (index) => {
      update((items) => {
        // If index is out of bounds, return unchanged
        if (index < 0 || index >= items.length) return items;

        const itemToRemove = items[index];

        // Remove highlight from webpage if highlightId exists
        if (
          itemToRemove.highlightId &&
          typeof chrome !== "undefined" &&
          chrome.tabs
        ) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "removeHighlight",
                highlightId: itemToRemove.highlightId,
              });
            }
          });
        }

        // Remove the item
        const updatedItems = [
          ...items.slice(0, index),
          ...items.slice(index + 1),
        ];

        // Save to chrome.storage.local
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({
            contextStack: updatedItems,
            lastUpdated: Date.now(),
          });

          // Also update persistedSelections for backward compatibility
          chrome.storage.local.set({
            persistedSelections: updatedItems.map((s) => s.text),
            persistedTimestamp: Date.now(),
          });
        }

        return updatedItems;
      });
    },

    // Clear all context items
    clear: () => {
      // Remove all highlights from webpage
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "clearAllHighlights",
            });
          }
        });
      }

      set([]);

      // Clear from chrome.storage.local
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove([
          "contextStack",
          "persistedSelections",
          "persistedTimestamp",
        ]);
      }
    },

    // Load context items from storage
    load: () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(
          ["contextStack", "persistedSelections"],
          (result) => {
            let items = [];

            if (result.contextStack && Array.isArray(result.contextStack)) {
              items = result.contextStack;
            } else if (
              result.persistedSelections &&
              Array.isArray(result.persistedSelections)
            ) {
              items = result.persistedSelections.map((text) => ({
                text,
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now(),
                highlightId: null,
              }));

              chrome.storage.local.set({
                contextStack: items,
                lastUpdated: Date.now(),
              });
            }

            set(items);
          }
        );
      }
    },
  };
}

// Create a store for query stack (user questions)
function createQueryStackStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    // Add a new query
    add: (text) => {
      if (!text || !text.trim()) return;

      const query = {
        text: text.trim(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
      };

      update((items) => {
        const updatedItems = [...items, query];

        // Save to chrome.storage.local
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({
            queryStack: updatedItems,
            lastUpdated: Date.now(),
          });
        }

        return updatedItems;
      });
    },

    // Clear all queries
    clear: () => {
      set([]);

      // Clear from chrome.storage.local
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove(["queryStack"]);
      }
    },

    // Load queries from storage
    load: () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["queryStack"], (result) => {
          if (result.queryStack && Array.isArray(result.queryStack)) {
            set(result.queryStack);
          }
        });
      }
    },
  };
}

// Export the stores
export const contextStack = createContextStackStore();
export const queryStack = createQueryStackStore();
