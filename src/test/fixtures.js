// Shared test fixture: a known set of mock tasks (like f12CHF / f14CHF / f28USD in the JUnit guide).
// Returns fresh objects every call so one test can't change another test's data.
export function makeMockTasks() {
  return {
    highSoon: {
      id: "t1",
      title: "Lab 3 report",
      description: "",
      dueDate: "2026-11-20",
      priority: "High",
      status: "Not Started",
      course: "CPS 714",
    },
    highLater: {
      id: "t2",
      title: "Final project",
      description: "",
      dueDate: "2026-12-10",
      priority: "High",
      status: "In Progress",
      course: "CPS 714",
    },
    mediumMid: {
      id: "t3",
      title: "Reading quiz",
      description: "",
      dueDate: "2026-11-25",
      priority: "Medium",
      status: "Not Started",
      course: "CPS 510",
    },
    lowSoonest: {
      id: "t4",
      title: "Forum post",
      description: "",
      dueDate: "2026-11-19",
      priority: "Low",
      status: "Not Started",
      course: "",
    },
    completed: {
      id: "t5",
      title: "Assignment 1",
      description: "",
      dueDate: "2026-11-01",
      priority: "Medium",
      status: "Completed",
      course: "CPS 510",
    },
  };
}
