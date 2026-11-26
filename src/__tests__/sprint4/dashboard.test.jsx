// Unit tests for SM-13: Dashboard
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import StatCards from "../../components/StatCards";
import { getOverdueTasks, getTaskStats, getUpcomingTasks } from "../../utils/dashboard";
import { makeMockTasks } from "../../test/fixtures";

// "Today" for every test in this file: Wed Nov 18 2026, 9:00 AM local time
const FROZEN_NOW = new Date(2026, 10, 18, 9, 0, 0);

describe("SM-13 Dashboard", () => {
  let tasks;
  let list; // every task below, in no particular order

  beforeAll(() => {
    console.log("@beforeAll (dashboard)");
  });

  afterAll(() => {
    console.log("@afterAll (dashboard)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    // Only fake Date so the clock is frozen but React Testing Library's timers still run
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(FROZEN_NOW);

    tasks = makeMockTasks();
    // Extra tasks around the 7-day window, built from the shared fixture
    tasks.overdue = { ...tasks.mediumMid, id: "t6", title: "Lab 2 corrections", dueDate: "2026-11-15", status: "In Progress" };
    tasks.dueToday = { ...tasks.lowSoonest, id: "t7", title: "Discussion reply", dueDate: "2026-11-18" };
    tasks.eightDaysOut = { ...tasks.mediumMid, id: "t8", title: "Midterm review", dueDate: "2026-11-26" };
    list = [
      tasks.mediumMid, // Nov 25, Not Started (exactly 7 days out)
      tasks.highLater, // Dec 10, In Progress
      tasks.eightDaysOut, // Nov 26, Not Started
      tasks.lowSoonest, // Nov 19, Not Started
      tasks.completed, // Nov 1, Completed
      tasks.overdue, // Nov 15, In Progress
      tasks.highSoon, // Nov 20, Not Started
      tasks.dueToday, // Nov 18, Not Started
    ];
  });

  afterEach(() => {
    console.log("@afterEach");
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const ids = (arr) => arr.map((t) => t.id);

  // TC-45 (stat cards show correct counts) / SM-13
  it("UT-20: stat cards show correct total, completed, in progress, and not started counts", () => {
    console.log("@Test: UT-20 stat card counts");
    const stats = getTaskStats(list);
    expect(stats).toEqual({ total: 8, completed: 1, inProgress: 2, notStarted: 5 });

    render(<StatCards stats={stats} />);
    const card = (name) => screen.getByRole("group", { name });
    expect(within(card("Total tasks")).getByText("8")).toBeInTheDocument();
    expect(within(card("Completed")).getByText("1")).toBeInTheDocument();
    expect(within(card("In progress")).getByText("2")).toBeInTheDocument();
    expect(within(card("Not started")).getByText("5")).toBeInTheDocument();
  });

  // TC-46 (only tasks due in the next 7 days are upcoming) / SM-13
  it("UT-21: upcoming deadlines only include tasks due in the next 7 days", () => {
    console.log("@Test: UT-21 upcoming window is 7 days");
    const upcoming = ids(getUpcomingTasks(list));
    // Today (Nov 18) through Nov 25 (today + 7) are in
    expect(upcoming).toEqual(expect.arrayContaining(["t7", "t4", "t1", "t3"]));
    expect(upcoming).toHaveLength(4);
    // Nov 26 (8 days), Dec 10, and past-due tasks are out
    expect(upcoming).not.toContain(tasks.eightDaysOut.id);
    expect(upcoming).not.toContain(tasks.highLater.id);
    expect(upcoming).not.toContain(tasks.overdue.id);
  });

  // TC-46 (upcoming list order) / SM-13
  it("UT-22: upcoming deadlines are ordered nearest first", () => {
    console.log("@Test: UT-22 upcoming sorted nearest first");
    const upcoming = getUpcomingTasks(list);
    expect(upcoming.map((t) => t.dueDate)).toEqual(["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-25"]);
  });

  // TC-47 (past due task appears in overdue section) / SM-13
  it("UT-23: tasks past their due date appear in the overdue section", () => {
    console.log("@Test: UT-23 past due tasks are overdue");
    const overdue = getOverdueTasks(list);
    expect(ids(overdue)).toEqual([tasks.overdue.id]);
    // A task due today is not overdue yet
    expect(ids(overdue)).not.toContain(tasks.dueToday.id);
  });

  // Extra edge case (no TC) / SM-13: finishing a late task removes it from the overdue section
  it("UT-24: completed tasks are not listed as overdue", () => {
    console.log("@Test: UT-24 completed tasks are not overdue");
    // Fixture task "Assignment 1" was due Nov 1 but is Completed
    expect(ids(getOverdueTasks(list))).not.toContain(tasks.completed.id);

    // Once the overdue task is marked Completed it leaves the overdue list too
    const afterCompleting = list.map((t) => (t.id === tasks.overdue.id ? { ...t, status: "Completed" } : t));
    expect(getOverdueTasks(afterCompleting)).toEqual([]);
  });
});
