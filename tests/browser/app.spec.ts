import { test, expect } from "@playwright/test";
test("Arabic defaults, original video, all eight empty routes and preferences", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("video source")).toHaveAttribute(
    "src",
    "/assets/school-intro.mp4",
  );
  await expect(page.locator(".splash")).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".category-card")).toHaveCount(8);
  await expect(page.locator(".server-status")).toHaveClass(/connected/);
  for (const id of [
    "homework",
    "timetable",
    "tutor",
    "classes",
    "planner",
    "teachers",
    "exams",
    "announcements",
  ]) {
    await page.locator(`.category-card[href="/${id}"]`).click();
    await expect(page.locator(".empty-panel")).toBeVisible();
    await expect(page.locator(".empty-body p")).not.toBeEmpty();
    if (id === "tutor")
      await expect(page.locator(".chat-preview input")).toBeDisabled();
    await page.reload();
    await expect(page.locator(".empty-panel")).toBeVisible();
    await expect(page.locator(".splash")).toHaveCount(0);
    await page.locator(".back").click();
  }
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("h1")).toHaveText("Welcome to Baghdadia School");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});
test("320px to desktop, both directions and themes without overflow", async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem("intro", "1"));
  await page.goto("/");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    for (const language of ["ar", "en"]) {
      if ((await page.locator("html").getAttribute("lang")) !== language)
        await page.locator(".language").click();
      for (const theme of ["light", "dark"]) {
        if ((await page.locator("html").getAttribute("data-theme")) !== theme)
          await page.locator(".icon-button").click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
  }
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
});
test("manifest, assets, security, offline shell and navigation", async ({
  page,
  context,
  request,
}) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.icons.length).toBe(2);
  for (const asset of [
    "/assets/school-intro.mp4",
    ...manifest.icons.map((i: any) => i.src),
  ])
    expect((await request.get(asset)).ok()).toBe(true);
  expect((await request.get("/missing.js")).status()).toBe(404);
  await page.addInitScript(() => sessionStorage.setItem("intro", "1"));
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.locator("h1")).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".category-card")).toHaveCount(8);
  await page.locator('.category-card[href="/tutor"]').click();
  await expect(page.locator(".chat-preview input")).toBeDisabled();
  await context.setOffline(false);
});
test("failed video and reduced motion never block access", async ({ page }) => {
  await page.route("**/assets/school-intro.mp4", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".splash")).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator(".category-card")).toHaveCount(8);
  await page.evaluate(() => sessionStorage.removeItem("intro"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".splash")).toHaveCount(0, { timeout: 2000 });
});

test("About credit is bilingual with a usable phone link on mobile", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro", "1"));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/about");
  await expect(page.locator(".creator-credit h3")).toHaveText("يوسف مصطفى فائق");
  await expect(page.locator(".creator-phone")).toHaveAttribute("href", "tel:07721604061");
  await expect(page.locator(".creator-phone bdi")).toHaveText("07721604061");
  await page.locator(".language").click();
  await expect(page.locator(".creator-credit")).toContainText("Made and designed by");
  await expect(page.locator(".creator-credit h3")).toHaveText("Yousif Mustafa Faek");
  await page.locator(".icon-button").click();
  await expect(page.locator(".creator-phone")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
