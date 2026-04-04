type PreloadTarget = "posts" | "comments";

export interface PreloadOptions {
  target: PreloadTarget;
  maxScrollSteps?: number;
  stepPx?: number;
  settleMs?: number;
  idleRounds?: number;
  maxItems?: number;
  restoreScroll?: boolean;
  debug?: boolean;
}

const DEFAULTS: Required<Omit<PreloadOptions, "target">> = {
  maxScrollSteps: 12,
  stepPx: 1200,
  settleMs: 700,
  idleRounds: 2,
  maxItems: 80,
  restoreScroll: true,
  debug: false,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSelector(target: PreloadTarget) {
  return target === "posts" ? "shreddit-post" : "shreddit-comment";
}

function getItemCount(target: PreloadTarget) {
  return document.querySelectorAll(getSelector(target)).length;
}

function log(debug: boolean, ...args: unknown[]) {
  if (!debug) return;
  console.log("[Reddix preload]", ...args);
}

function getScrollableHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight,
  );
}

function isNearBottom(threshold = 120) {
  const viewportBottom = window.scrollY + window.innerHeight;
  return viewportBottom >= getScrollableHeight() - threshold;
}

export async function preloadRedditContent(
  options: PreloadOptions,
): Promise<number> {
  const {
    target,
    maxScrollSteps,
    stepPx,
    settleMs,
    idleRounds,
    maxItems,
    restoreScroll,
    debug,
  } = {
    ...DEFAULTS,
    ...options,
  };

  const selector = getSelector(target);
  const initialX = window.scrollX;
  const initialY = window.scrollY;

  let lastCount = getItemCount(target);
  let idleCount = 0;

  log(debug, `starting preload for ${target}`);
  log(debug, `initial ${selector} count:`, lastCount);

  // If enough content is already present, don't move the page at all.
  if (lastCount >= maxItems) {
    log(debug, "skipping preload: maxItems already satisfied");
    return lastCount;
  }

  try {
    for (let step = 0; step < maxScrollSteps; step++) {
      window.scrollBy({
        left: 0,
        top: stepPx,
        behavior: "auto",
      });

      await sleep(settleMs);

      const currentCount = getItemCount(target);
      const reachedBottom = isNearBottom();

      log(debug, `step ${step + 1}/${maxScrollSteps}`, {
        currentCount,
        lastCount,
        idleCount,
        reachedBottom,
      });

      if (currentCount >= maxItems) {
        log(debug, "stopping: reached maxItems");
        lastCount = currentCount;
        break;
      }

      if (currentCount === lastCount) {
        idleCount += 1;
      } else {
        idleCount = 0;
        lastCount = currentCount;
      }

      if (idleCount >= idleRounds) {
        log(debug, "stopping: idleRounds reached");
        break;
      }

      if (reachedBottom) {
        log(debug, "stopping: reached page bottom");
        break;
      }
    }
  } finally {
    if (restoreScroll) {
      window.scrollTo({
        left: initialX,
        top: initialY,
        behavior: "auto",
      });
      log(debug, "scroll position restored");
    }
  }

  const finalCount = getItemCount(target);
  log(debug, `final ${selector} count:`, finalCount);
  return finalCount;
}

export async function preloadPosts(
  options: Omit<PreloadOptions, "target"> = {},
) {
  return preloadRedditContent({
    target: "posts",
    ...options,
  });
}

export async function preloadComments(
  options: Omit<PreloadOptions, "target"> = {},
) {
  return preloadRedditContent({
    target: "comments",
    ...options,
  });
}
