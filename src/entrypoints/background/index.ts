// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

export default defineBackground({
  main() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "post",
        title: "Post Insights",
        contexts: ["all"],
      });
    });

    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "Comments",
        title: "Comment Insights",
        contexts: ["all"],
      });
    });
  },
});
