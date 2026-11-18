// Unit tests for SM-09: Sorting
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sortTasks } from "../tasks";
import { makeMockTasks } from "../test/fixtures";

describe("SM-09 Sorting", () => {
  let tasks;
  let list; // fixture tasks in a deliberately unsorted order

  beforeAll(() => {
    console.log("@beforeAll (sorting)");
  });

  afterAll(() => {
    console.log("@afterAll (sorting)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    tasks = makeMockTasks();
    list = [tasks.mediumMid, tasks.highLater, tasks.lowSoonest, tasks.completed, tasks.highSoon];
  });

  afterEach(() => {
    console.log("@afterEach");
  });

  const ids = (arr) => arr.map((t) => t.id);

  // TC-31 (sort by due date) / SM-09
  it("UT-08: sort by due date puts the nearest deadline first", () => {
    console.log("@Test: UT-08 sort by due date");
    const sorted = sortTasks(list, "deadline");
    expect(sorted.map((t) => t.dueDate)).toEqual([
      "2026-11-01",
      "2026-11-19",
      "2026-11-20",
      "2026-11-25",
      "2026-12-10",
    ]);
  });

  // TC-32 (sort by priority) / SM-09
  it("UT-09: sort by priority orders High, then Medium, then Low", () => {
    console.log("@Test: UT-09 sort by priority");
    const sorted = sortTasks(list, "priority");
    expect(sorted.map((t) => t.priority)).toEqual(["High", "High", "Medium", "Medium", "Low"]);
  });

  // TC-33 (same priority ordered by due date) / SM-09
  it("UT-10: tasks with the same priority are ordered by due date", () => {
    console.log("@Test: UT-10 same priority tie-break by due date");
    const sorted = sortTasks(list, "priority");
    expect(ids(sorted)).toEqual([
      tasks.highSoon.id, // High, Nov 20
      tasks.highLater.id, // High, Dec 10
      tasks.completed.id, // Medium, Nov 1
      tasks.mediumMid.id, // Medium, Nov 25
      tasks.lowSoonest.id, // Low (soonest date overall, still last)
    ]);
  });

  // Extra edge case (no TC) / SM-09: sorting must not reorder the live task list in place
  it("UT-11: sorting returns a new array and leaves the original order untouched", () => {
    console.log("@Test: UT-11 sort does not mutate input");
    const before = ids(list);
    const sorted = sortTasks(list, "priority");
    expect(sorted).not.toBe(list);
    expect(ids(list)).toEqual(before);
  });

  // Expected error, extra edge case (no TC) / SM-09: invalid input throws instead of silently returning garbage
  it("UT-12: sorting invalid input throws a TypeError", () => {
    console.log("@Test: UT-12 invalid input throws");
    expect(() => sortTasks(null, "deadline")).toThrow(TypeError);
    expect(() => sortTasks(undefined, "priority")).toThrow(TypeError);
    expect(() => sortTasks(42, "deadline")).toThrow(TypeError); // not iterable
  });
});
