// Content should use custom css and not shadcn
import "../initial.css";
export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Hello content.");
  },
});
