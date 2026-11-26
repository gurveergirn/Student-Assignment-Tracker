// Unit tests for SM-15: Progress bar
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { onSnapshot } from "firebase/firestore";
import ProgressBar from "../../components/ProgressBar";
import { subscribeToTasks } from "../../tasks";
import { PROGRESS_EMPTY_MESSAGE, getProgress } from "../../utils/progress";
import { getOverdueTasks, getTaskStats, getUpcomingTasks } from "../../utils/dashboard";
import { filterTasks } from "../../utils/searchFilter";
import { makeMockTasks } from "../../test/fixtures";

describe("SM-15 Progress bar", () => {
  let tasks;
  let fourTasks; // 4 open tasks: t1-t4

  beforeAll(() => {
    console.log("@beforeAll (progress)");
  });

  afterAll(() => {
    console.log("@afterAll (progress)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    tasks = makeMockTasks();
    fourTasks = [tasks.highSoon, tasks.highLater, tasks.mediumMid, tasks.lowSoonest];
  });

  afterEach(() => {
    console.log("@afterEach");
    vi.clearAllMocks();
  });

  const complete = (list, id) => list.map((t) => (t.id === id ? { ...t, status: "Completed" } : t));
  // Fake Firestore snapshot for a list of tasks
  const snapshotOf = (list) => ({
    docs: list.map(({ id, ...data }) => ({ id, data: () => data })),
  });

  // TC-52 (2 of 4 completed shows 50%) / SM-15
  it("UT-31: progress shows 50% when 2 of 4 tasks are completed", () => {
    console.log("@Test: UT-31 two of four completed is 50%");
    const list = complete(complete(fourTasks, "t1"), "t3");
    const progress = getProgress(list);
    expect(progress).toMatchObject({ total: 4, completed: 2, percent: 50, isEmpty: false });

    render(createElement(ProgressBar, { progress }));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("2 of 4 tasks completed")).toBeInTheDocument();
  });

  // TC-53 (progress updates without a page refresh) / SM-15
  it("UT-32: progress updates when a task is marked complete", () => {
    console.log("@Test: UT-32 progress follows the live listener");
    // Capture the real-time listener's callback so the test can push new snapshots like Firestore does
    let pushSnapshot;
    onSnapshot.mockImplementation((_q, onNext) => {
      pushSnapshot = onNext;
      return () => {};
    });
    const percents = [];
    subscribeToTasks("test-user", (list) => percents.push(getProgress(list).percent), vi.fn());

    pushSnapshot(snapshotOf(fourTasks)); // initial load: 0 of 4
    const afterOne = complete(fourTasks, "t1");
    pushSnapshot(snapshotOf(afterOne)); // a task is marked complete
    pushSnapshot(snapshotOf(complete(afterOne, "t2"))); // and another

    expect(percents).toEqual([0, 25, 50]);

    // The bar itself re-renders with the new value (no remount / page reload)
    const { rerender } = render(createElement(ProgressBar, { progress: getProgress(fourTasks) }));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    rerender(createElement(ProgressBar, { progress: getProgress(afterOne) }));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  // Extra edge case (no TC) / SM-15
  it("UT-33: zero tasks shows an empty state instead of 0% or NaN", () => {
    console.log("@Test: UT-33 empty state with no tasks");
    const progress = getProgress([]);
    expect(progress).toMatchObject({ total: 0, completed: 0, percent: null, isEmpty: true });
    expect(progress.label).toBe(PROGRESS_EMPTY_MESSAGE);

    const { container } = render(createElement(ProgressBar, { progress }));
    expect(screen.getByText(PROGRESS_EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent("%");
    expect(container).not.toHaveTextContent("NaN");
  });

  // Expected error, extra edge case (no TC) / SM-13, SM-14, SM-15: every list helper rejects bad input
  it("UT-34: invalid input (null or not a list) throws a TypeError", () => {
    console.log("@Test: UT-34 invalid input throws");
    expect(() => getProgress(null)).toThrow(TypeError);
    expect(() => getProgress(undefined)).toThrow(TypeError);
    expect(() => getProgress({ length: 4 })).toThrow(TypeError); // array-like is still not a list
    expect(() => getProgress("tasks")).toThrow(TypeError);
    // The dashboard and search helpers use the same guard
    expect(() => getTaskStats(null)).toThrow(TypeError);
    expect(() => getUpcomingTasks(42)).toThrow(TypeError);
    expect(() => getOverdueTasks({})).toThrow(TypeError);
    expect(() => filterTasks(null, { search: "lab" })).toThrow(TypeError);
  });
});
