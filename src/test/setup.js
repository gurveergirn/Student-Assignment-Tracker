// Runs before every test file (see "setupFiles" in vite.config.js)
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Unmount anything a test rendered so tests can't affect each other
afterEach(() => cleanup());

// ---- Firebase mocks: no test is allowed to reach the real project ----

// Our own firebase.js would call initializeApp() with real config, so replace it with stubs
vi.mock("../firebase.js", () => ({
  auth: { currentUser: { uid: "test-user" } },
  db: { type: "mock-firestore" },
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: "test-user" } })),
  onAuthStateChanged: vi.fn(() => () => {}),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Firestore functions return plain objects/spies so tests can check what *would* be written
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn((_db, ...path) => ({ path: path.join("/") })),
  doc: vi.fn((parent, id) => ({ path: `${parent.path}/${id}` })),
  query: vi.fn((ref) => ref),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  addDoc: vi.fn(() => Promise.resolve({ id: "new-id" })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  runTransaction: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
}));
