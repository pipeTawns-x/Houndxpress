import { transitionRoute } from "./routeTransition.ts";
import { stubGlobal } from "../test/stubGlobal.ts";
afterEach(() => {
  delete document.documentElement.dataset.motion;
  Reflect.deleteProperty(document, "startViewTransition");
});
it("navigates without the API and when motion is reduced", () => {
  const go = jest.fn();
  transitionRoute(go);
  expect(go).toHaveBeenCalledTimes(1);
  const start = jest.fn();
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  stubGlobal("matchMedia", () => ({ matches: true }));
  transitionRoute(go);
  expect(go).toHaveBeenCalledTimes(2);
  expect(start).not.toHaveBeenCalled();
});
it("uses native transition and preserves navigation if it refuses", () => {
  const go = jest.fn();
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: jest.fn((update: () => void) => {
      update();
      return { finished: Promise.resolve() };
    }),
  });
  transitionRoute(go);
  expect(go).toHaveBeenCalledTimes(1);
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: () => {
      throw new Error("unsupported");
    },
  });
  transitionRoute(go);
  expect(go).toHaveBeenCalledTimes(2);
});
it("does not navigate twice if a transition fails after updating", () => {
  const go = jest.fn();
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: (update: () => void) => {
      update();
      throw new Error("late refusal");
    },
  });
  transitionRoute(go);
  expect(go).toHaveBeenCalledTimes(1);
});
