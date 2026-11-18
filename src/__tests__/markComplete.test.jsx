// Unit tests for SM-10: Mark complete
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { updateDoc } from "firebase/firestore";
import TaskCard from "../components/TaskCard";
import { markTaskComplete, taskErrorMessage } from "../tasks";
import { makeMockTasks } from "../test/fixtures";

describe("SM-10 Mark complete", () => {
  let tasks;

  beforeAll(() => {
    console.log("@beforeAll (markComplete)");
  });

  afterAll(() => {
    console.log("@afterAll (markComplete)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    tasks = makeMockTasks();
  });

  afterEach(() => {
    console.log("@afterEach");
    vi.clearAllMocks();
  });

  const renderCard = (task, onComplete = vi.fn(() => Promise.resolve())) => {
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onComplete={onComplete} />);
    return onComplete;
  };

  // TC-34 (mark task complete) / SM-10
  it("UT-13: clicking Mark Complete calls the complete handler with that task", async () => {
    console.log("@Test: UT-13 Mark Complete click");
    const onComplete = renderCard(tasks.highSoon);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Mark Lab 3 report complete" }));
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(tasks.highSoon);
  });

  // TC-34 (mark task complete) / SM-10
  it("UT-14: markTaskComplete sets status to Completed in Firestore (mocked)", async () => {
    console.log("@Test: UT-14 markTaskComplete writes Completed");
    await markTaskComplete("test-user", tasks.highSoon);

    expect(updateDoc).toHaveBeenCalledTimes(1);
    const [ref, data] = updateDoc.mock.calls[0];
    expect(ref.path).toBe("users/test-user/tasks/t1");
    expect(data).toEqual({ status: "Completed", priority: "High", updatedAt: "SERVER_TIMESTAMP" });
  });

  // TC-35 (completed tasks visually distinct) / SM-10
  it("UT-15: completed tasks are visually distinct", () => {
    console.log("@Test: UT-15 completed task styling");
    renderCard(tasks.completed);
    const title = screen.getByRole("heading", { name: "Assignment 1" });
    expect(title).toHaveClass("line-through");
    expect(title.closest("li")).toHaveClass("opacity-60");

    const button = screen.getByRole("button", { name: "Assignment 1 is completed" });
    expect(button).toHaveTextContent("Completed");
    expect(button).toBeDisabled();
  });

  // TC-35 (completed tasks visually distinct) / SM-10
  it("UT-16: tasks that are not completed have no completed styling", () => {
    console.log("@Test: UT-16 open task styling");
    renderCard(tasks.mediumMid);
    const title = screen.getByRole("heading", { name: "Reading quiz" });
    expect(title).not.toHaveClass("line-through");
    expect(title.closest("li")).not.toHaveClass("opacity-60");
    expect(screen.getByRole("button", { name: "Mark Reading quiz complete" })).toBeEnabled();
  });

  // TC-36 (rapid clicks don't duplicate writes) / SM-10
  it("UT-17: rapid clicks only trigger one update; button disables after the first click", async () => {
    console.log("@Test: UT-17 rapid clicks send one update");
    let finishWrite;
    const onComplete = vi.fn(() => new Promise((resolve) => (finishWrite = resolve)));
    renderCard(tasks.highSoon, onComplete);
    const button = screen.getByRole("button", { name: "Mark Lab 3 report complete" });

    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Once the write finishes the button is usable again (the live listener then flips it to "Completed")
    await act(async () => finishWrite());
    expect(button).toBeEnabled();
  });

  // Expected error, extra edge case (no TC) / SM-10: a failed Firestore write is reported, not swallowed
  it("UT-18: markTaskComplete rejects when Firestore refuses the write", async () => {
    console.log("@Test: UT-18 failed write rejects");
    const denied = Object.assign(new Error("Missing or insufficient permissions."), { code: "permission-denied" });
    updateDoc.mockRejectedValueOnce(denied);

    await expect(markTaskComplete("test-user", tasks.highSoon)).rejects.toThrow("Missing or insufficient permissions.");
    expect(taskErrorMessage(denied)).toMatch(/Firestore blocked this change/);
  });
});
