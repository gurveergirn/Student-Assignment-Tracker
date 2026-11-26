// Unit tests for SM-14: Search and filter
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { filterTasks } from "../../utils/searchFilter";
import { makeMockTasks } from "../../test/fixtures";

describe("SM-14 Search and filter", () => {
  let tasks;
  let list;

  beforeAll(() => {
    console.log("@beforeAll (searchFilter)");
  });

  afterAll(() => {
    console.log("@afterAll (searchFilter)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    tasks = makeMockTasks();
    list = [tasks.highSoon, tasks.highLater, tasks.mediumMid, tasks.lowSoonest, tasks.completed];
  });

  afterEach(() => {
    console.log("@afterEach");
  });

  const ids = (arr) => arr.map((t) => t.id);

  // TC-48 (search shows only matching tasks) / SM-14
  it("UT-25: keyword search returns only tasks whose title matches", () => {
    console.log("@Test: UT-25 keyword search");
    expect(ids(filterTasks(list, { search: "report" }))).toEqual([tasks.highSoon.id]);
    expect(ids(filterTasks(list, { search: "quiz" }))).toEqual([tasks.mediumMid.id]);
    // Only titles are searched: "CPS" is in course names but no titles
    expect(filterTasks(list, { search: "CPS" })).toEqual([]);
    expect(filterTasks(list, { search: "no such task" })).toEqual([]);
  });

  // Extra edge case (no TC) / SM-14
  it("UT-26: search is case insensitive", () => {
    console.log("@Test: UT-26 case-insensitive search");
    expect(ids(filterTasks(list, { search: "LAB 3 REPORT" }))).toEqual([tasks.highSoon.id]);
    expect(ids(filterTasks(list, { search: "lAb" }))).toEqual([tasks.highSoon.id]);
    expect(ids(filterTasks(list, { search: "final PROJECT" }))).toEqual([tasks.highLater.id]);
  });

  // TC-49 (course filter) / SM-14
  it("UT-27: filtering by course returns only that course's tasks", () => {
    console.log("@Test: UT-27 course filter");
    expect(ids(filterTasks(list, { course: "CPS 510" }))).toEqual([tasks.mediumMid.id, tasks.completed.id]);
    expect(ids(filterTasks(list, { course: "CPS 714" }))).toEqual([tasks.highSoon.id, tasks.highLater.id]);
    // Course names are grouped case-insensitively elsewhere in the app, so the filter matches that
    expect(ids(filterTasks(list, { course: "cps 510" }))).toEqual([tasks.mediumMid.id, tasks.completed.id]);
  });

  // TC-50 (status filter) / SM-14
  it("UT-28: filtering by status returns only tasks with that status", () => {
    console.log("@Test: UT-28 status filter");
    expect(ids(filterTasks(list, { status: "Not Started" }))).toEqual([
      tasks.highSoon.id,
      tasks.mediumMid.id,
      tasks.lowSoonest.id,
    ]);
    expect(ids(filterTasks(list, { status: "In Progress" }))).toEqual([tasks.highLater.id]);
    expect(ids(filterTasks(list, { status: "Completed" }))).toEqual([tasks.completed.id]);
  });

  // TC-51 (search and filters combined) / SM-14
  it("UT-29: search and filters combined return tasks matching all of them", () => {
    console.log("@Test: UT-29 search + course + status combined");
    expect(ids(filterTasks(list, { search: "project", course: "CPS 714", status: "In Progress" }))).toEqual([
      tasks.highLater.id,
    ]);
    // Course matches but status doesn't
    expect(filterTasks(list, { search: "report", course: "CPS 714", status: "Completed" })).toEqual([]);
    // Title matches but course doesn't
    expect(filterTasks(list, { search: "report", course: "CPS 510" })).toEqual([]);
    // Course + status without a search
    expect(ids(filterTasks(list, { course: "CPS 510", status: "Not Started" }))).toEqual([tasks.mediumMid.id]);
  });

  // Extra edge case (no TC) / SM-14
  it("UT-30: empty search with no filters returns all tasks", () => {
    console.log("@Test: UT-30 no search or filters returns everything");
    expect(ids(filterTasks(list, { search: "", course: "", status: "" }))).toEqual(ids(list));
    expect(ids(filterTasks(list, { search: "   " }))).toEqual(ids(list)); // only spaces counts as empty
    expect(ids(filterTasks(list))).toEqual(ids(list));
  });
});
