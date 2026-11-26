// Unit tests for SM-08: Priority levels
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { onSnapshot } from "firebase/firestore";
import TaskForm from "../../components/TaskForm";
import TaskCard from "../../components/TaskCard";
import { PRIORITIES, subscribeToTasks, validateTask } from "../../tasks";
import { PRIORITY_STYLES, priorityStyle } from "../../utils/priority";
import { makeMockTasks } from "../../test/fixtures";

// Copy of obj without one field (e.g. a task saved before priorities existed)
const without = (obj, key) => Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

describe("SM-08 Priority levels", () => {
  let tasks;

  beforeAll(() => {
    console.log("@beforeAll (priority)");
  });

  afterAll(() => {
    console.log("@afterAll (priority)");
  });

  beforeEach(() => {
    console.log("@beforeEach");
    tasks = makeMockTasks();
  });

  afterEach(() => {
    console.log("@afterEach");
    vi.clearAllMocks();
  });

  // Helper: render the card for a task and return its "<priority> priority" badge
  const renderBadge = (task) => {
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onComplete={vi.fn()} />);
    return screen.getByText(`${task.priority} priority`);
  };

  // TC-27 (assign priority on create) / SM-08
  it("UT-01: task form offers Low, Medium and High and saves the selected priority", async () => {
    console.log("@Test: UT-01 task form priority selection");
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => Promise.resolve());
    render(<TaskForm courses={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    const select = screen.getByLabelText(/Priority/);
    const options = within(select).getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Low", "Medium", "High"]);

    await user.type(screen.getByLabelText(/Title/), "Lab 3 report");
    fireEvent.change(screen.getByLabelText(/Due date/), { target: { value: "2026-12-01" } });
    await user.selectOptions(select, "High");
    expect(select).toHaveValue("High");

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].priority).toBe("High");
  });

  // TC-29 (colour-coded labels) / SM-08
  it("UT-02: each priority maps to the correct colour (Low green, Medium amber, High red)", () => {
    console.log("@Test: UT-02 priority colour mapping");
    expect(priorityStyle("Low")).toContain("green");
    expect(priorityStyle("Medium")).toContain("amber");
    expect(priorityStyle("High")).toContain("red");
    // Every priority the form offers has a colour
    expect(Object.keys(PRIORITY_STYLES).sort()).toEqual([...PRIORITIES].sort());
  });

  // TC-29 (colour-coded labels) / SM-08
  it("UT-03: task cards render the priority badge in its colour", () => {
    console.log("@Test: UT-03 priority badge colour on task card");
    expect(renderBadge(tasks.highSoon)).toHaveClass("bg-red-100", "text-red-800");
    expect(renderBadge(tasks.mediumMid)).toHaveClass("bg-amber-100", "text-amber-800");
    expect(renderBadge(tasks.lowSoonest)).toHaveClass("bg-green-100", "text-green-800");
  });

  // TC-27 (assign priority on create: Medium is pre-selected) / SM-08
  it("UT-04: a new task form defaults priority to Medium", () => {
    console.log("@Test: UT-04 new task defaults to Medium");
    render(<TaskForm courses={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Priority/)).toHaveValue("Medium");
  });

  // TC-30 (older tasks default to Medium) / SM-08
  it("UT-05: tasks loaded from Firestore with no priority default to Medium", () => {
    console.log("@Test: UT-05 stored task without priority defaults to Medium");
    const oldTask = without(tasks.highSoon, "priority"); // a pre-Sprint-3 task with no priority field
    const fakeSnapshot = {
      docs: [
        { id: oldTask.id, data: () => without(oldTask, "id") },
        { id: tasks.lowSoonest.id, data: () => ({ ...tasks.lowSoonest }) },
      ],
    };
    onSnapshot.mockImplementation((_q, onNext) => {
      onNext(fakeSnapshot);
      return () => {};
    });

    const onChange = vi.fn();
    subscribeToTasks("test-user", onChange, vi.fn());

    const loaded = onChange.mock.calls[0][0];
    expect(loaded[0].priority).toBe("Medium");
    expect(loaded[1].priority).toBe("Low"); // an existing priority is not overwritten
  });

  // TC-30 (older tasks default to Medium, when opened in the edit form) / SM-08
  it("UT-06: editing a task with no priority pre-selects Medium", () => {
    console.log("@Test: UT-06 edit form defaults missing priority to Medium");
    const oldTask = without(tasks.highSoon, "priority");
    render(<TaskForm initialTask={oldTask} courses={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Priority/)).toHaveValue("Medium");
  });

  // Expected error, extra edge case (no TC) / SM-08: an unknown priority value is rejected, not saved
  it("UT-07: an unknown priority value fails validation", () => {
    console.log("@Test: UT-07 unknown priority is rejected");
    const { errors } = validateTask({ ...tasks.highSoon, priority: "Urgent" });
    expect(errors.priority).toBe("Choose a priority.");
    expect(priorityStyle("Urgent")).toBeUndefined();
  });

  // TC-28 (change priority on edit) / SM-08
  it("UT-19: editing a task can change its priority and saves the new value", async () => {
    console.log("@Test: UT-19 change priority on edit");
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => Promise.resolve());
    render(<TaskForm initialTask={tasks.lowSoonest} courses={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    const select = screen.getByLabelText(/Priority/);
    expect(select).toHaveValue("Low"); // form opens with the task's current priority

    await user.selectOptions(select, "High");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const saved = onSubmit.mock.calls[0][0];
    expect(saved.priority).toBe("High");
    expect(saved.title).toBe(tasks.lowSoonest.title); // other fields are kept
    expect(saved.dueDate).toBe(tasks.lowSoonest.dueDate);
  });
});
