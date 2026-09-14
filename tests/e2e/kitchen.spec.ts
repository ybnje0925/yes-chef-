import { test, expect, type Page } from "@playwright/test";
async function start(page: Page, name = "라면", demo = true) {
  await page.goto("/");
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  if (demo) await page.getByRole("switch").click();
  await page.getByRole("button", { name: new RegExp(name) }).click();
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "다 준비했습니다, 셰프!" }).click();
}
test("mobile home and menu have no overflow or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "오늘도 요리 망치러 왔나?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  await expect(page.locator(".recipe-card")).toHaveCount(4);
  await page.screenshot({
    path: "artifacts/recipes-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("early warning, override, pause, late warning and result work together", async ({
  page,
}) => {
  await page.clock.install();
  await start(page);
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "artifacts/early-warning.png" });
  await page.getByRole("button", { name: "죄송합니다 셰프" }).click();
  await page.clock.fastForward(600);
  await page.getByRole("button", { name: /그래도 넘어가기/ }).click();
  await expect(
    page.getByRole("heading", { name: "물이 끓으면 스프 넣어." }),
  ).toBeVisible();
  await page.clock.fastForward(2200);
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  await expect(page.locator(".timer strong")).toHaveText("00:10");
  await page.clock.fastForward(2000);
  await page.getByRole("button", { name: "일시정지", exact: true }).click();
  const frozen = await page.locator(".timer strong").innerText();
  await page.clock.fastForward(30000);
  await expect(page.locator(".timer strong")).toHaveText(frozen);
  await expect(
    page.getByRole("button", { name: "예, 셰프!", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "다시 시작", exact: true }).click();
  await page.clock.fastForward(20000);
  await expect(page.locator(".chef-message")).toContainText(
    /장례식|극딜|구조 신호|맛도 너를 방치|화재 예행연습|팬이 울고/,
  );
  await page.screenshot({ path: "artifacts/cooking-mobile.png" });
  await page.clock.fastForward(10000);
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  await page.clock.fastForward(2200);
  await page.getByRole("button", { name: "완성했습니다, 셰프!" }).click();
  await expect(
    page.getByRole("heading", { name: "오늘의 셰프 평가" }),
  ).toBeVisible();
  await expect(page.locator(".grade")).toContainText("B");
  await expect(page.locator(".result-stats")).toContainText("1회");
  await expect(page.locator(".scold-total")).toContainText("2회");
  await page.screenshot({
    path: "artifacts/result-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("yes-chef:stats:v1")!).count,
    ),
  ).toBe(0);
});
for (const [name, durations] of [
  ["알리오 올리오", [31, 6, 481, 6, 121, 11, 31, 31, 11]],
  ["김치볶음밥", [31, 61, 121, 121, 11]],
  ["계란볶음밥", [31, 61, 41, 121, 11]],
  ["라면", [31, 6, 241, 6]],
] as const) {
  test(`${name}: complete real recipe, persist S grade once`, async ({
    page,
  }) => {
    await page.clock.install();
    await start(page, name, false);
    for (let i = 0; i < durations.length; i++) {
      await page.clock.fastForward(durations[i] * 1000);
      await page
        .getByRole("button", {
          name:
            i === durations.length - 1 ? "완성했습니다, 셰프!" : "예, 셰프!",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "오늘의 셰프 평가" }),
    ).toBeVisible();
    await expect(page.locator(".grade")).toContainText("S");
    await page.clock.fastForward(5000);
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("yes-chef:stats:v1")!).count,
      ),
    ).toBe(1);
    await page.getByRole("button", { name: "다시 주방으로" }).click();
    await expect(page.locator(".stats-row")).toContainText("1회");
    await page.reload();
    await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
    await expect(page.locator(".stats-row")).toContainText("1회");
  });
}
test("installed service worker can open home and recipes offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "예, 셰프!", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "예, 셰프!", exact: true }).click();
  await expect(page.locator(".recipe-card")).toHaveCount(4);
  await context.setOffline(false);
});
