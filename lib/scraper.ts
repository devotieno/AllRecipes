import { Recipe, Tweak } from '@/types';
import { v4 as uuid } from 'uuid';

export async function scrapeRecipe(url: string): Promise<{ original: Recipe; tweaks: Tweak[] }> {
  const { chromium } = await import('playwright-extra');
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;

  chromium.use(StealthPlugin());

  const browser = await chromium.launch({
    headless: true,
    proxy: process.env.WEBSHARE_USER
      ? {
          server: 'http://p.webshare.io:80',
          username: process.env.WEBSHARE_USER,
          password: process.env.WEBSHARE_PASS,
        }
      : undefined,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    const page = await context.newPage();

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const clean = (text: string | null | undefined) => {
        if (!text) return '';
        return text
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const title = clean(document.querySelector('h1')?.textContent) || 'Untitled Recipe';

      // ===== INGREDIENTS =====
      let ingredients: string[] = [];

      const ingredientSelectors = [
        '.mntl-structured-ingredients__list-item',
        '[class*="structured-ingredients"] li',
        '[itemprop="recipeIngredient"]',
        '.ingredients-item-name',
        '.recipe-ingredients li',
      ];

      for (const selector of ingredientSelectors) {
        const els = document.querySelectorAll(selector);
        if (els.length > 2) {
          ingredients = Array.from(els)
            .map((el) => clean(el.textContent))
            .filter((t) => t.length > 2 && t.length < 140);
          break;
        }
      }

      // ===== INSTRUCTIONS =====
      let instructions: string[] = [];

      const instructionSelectors = [
        '.mntl-sc-block-group--P p',
        '.mntl-sc-block-group--P .mntl-sc-block-html',
        '[class*="instruction"] p',
        '[itemprop="recipeInstructions"] li',
        '[itemprop="recipeInstructions"] p',
        '.recipe-directions__list--item',
      ];

      for (const selector of instructionSelectors) {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          instructions = Array.from(els)
            .map((el) => clean(el.textContent))
            .filter((t) => t.length > 20 && !t.includes('http') && !t.includes('src='));
          if (instructions.length > 0) break;
        }
      }

      // ===== FEATURED TWEAKS =====
      const tweakEls = document.querySelectorAll(
        '[class*="review-card"], [class*="feedback"], [class*="ugc-review"], [class*="review"]'
      );

      const tweaksRaw: { author: string; text: string }[] = [];

      tweakEls.forEach((el) => {
        const text = clean(el.textContent);
        if (text.length < 50 || text.length > 900) return;

        const lower = text.toLowerCase();
        if (
          lower.includes('ingredients') ||
          lower.includes('directions') ||
          lower.includes('nutrition') ||
          lower.includes('ask the community')
        ) {
          return;
        }

        let author = 'Anonymous';
        const authorEl = el.querySelector(
          '[class*="author"], [class*="name"], [class*="username"], [class*="user-name"]'
        );
        if (authorEl) {
          author = clean(authorEl.textContent).replace(/^by\s+/i, '') || 'Anonymous';
        }

        tweaksRaw.push({ author, text });
      });

      // Strong deduplication
      const uniqueTweaks = tweaksRaw.filter(
        (t, i, self) =>
          i === self.findIndex((x) => x.text.slice(0, 70) === t.text.slice(0, 70))
      );

      return {
        title,
        ingredients: Array.from(new Set(ingredients)).slice(0, 25),
        instructions: Array.from(new Set(instructions)).slice(0, 15),
        tweaksRaw: uniqueTweaks.slice(0, 12), // keep more tweaks
      };
    });

    // Make sure every tweak becomes a real Tweak object
    const tweaks: Tweak[] = data.tweaksRaw.map((t) => ({
      id: uuid(),
      author: t.author || 'Anonymous',
      text: t.text,
    }));

    return {
      original: {
        title: data.title,
        ingredients:
          data.ingredients.length > 0
            ? data.ingredients
            : ['(Could not extract ingredients cleanly)'],
        instructions:
          data.instructions.length > 0
            ? data.instructions
            : ['(Could not extract instructions cleanly)'],
        url,
      },
      tweaks, // ← every item here will create one modified recipe
    };
  } finally {
    await browser.close();
  }
}