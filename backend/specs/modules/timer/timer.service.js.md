# modules/timer/timer.service.js

## Purpose

Business logic layer for timer operations. Handles timer state validation, error checking, and transformation of raw database rows into API response objects.

## Exports

- **`startTimer(taskId)`** (async): Start a timer for a task.
  - **Parameters:** `taskId` (number): Task ID (assumed already validated).
  - **Returns:** Promise resolving to:
    ```js
    {
      entryId: <number>,
      taskId: <number>,
      startedAt: "<ISO8601 DATETIME>"
    }
    ```
  - **Throws:**
    - `status: 404`, `message: "Task not found"` if task does not exist.
    - `status: 409`, `message: "Timer is already running for this task"` if a timer is already running.

- **`stopTimer(taskId)`** (async): Stop the running timer for a task.
  - **Parameters:** `taskId` (number): Task ID.
  - **Returns:** Promise resolving to:
    ```js
    {
      entryId: <number>,
      taskId: <number>,
      startedAt: "<ISO8601 DATETIME>",
      stoppedAt: "<ISO8601 DATETIME>",
      elapsedSeconds: <number>
    }
    ```
  - **Throws:**
    - `status: 404`, `message: "Task not found"` if task does not exist.
    - `status: 409`, `message: "No running timer for this task"` if no open timer is running.

- **`getTimerTotal(taskId)`** (async): Get total elapsed time and running state for a task.
  - **Parameters:** `taskId` (number): Task ID.
  - **Returns:** Promise resolving to:
    ```js
    {
      taskId: <number>,
      totalSeconds: <number>,
      isRunning: <boolean>
    }
    ```
  - **Throws:** `status: 404`, `message: "Task not found"` if task does not exist.

## Behavior / business rules

- **Task existence:** All operations first check that the task exists via `assertTaskExists()` (internal helper).
- **Start timer:**
  - Creates a new time entry with `started_at = NOW()`.
  - Rejects if a timer is already running (at most one per task).
  - Returns the entry ID, task ID, and start time.
- **Stop timer:**
  - Finds the open entry and updates `stopped_at = NOW()`.
  - Rejects if no timer is running.
  - Computes `elapsedSeconds = (stoppedAt - startedAt) / 1000`, rounded to nearest second.
  - Returns entry ID, task ID, start time, stop time, and elapsed seconds.
- **Get total:**
  - Queries the sum of all timer durations (including the current running timer, if any).
  - Returns the total in seconds, plus a boolean flag indicating if a timer is currently running.

## Dependencies

- **Imports:** `../tasks/tasks.repository`, `./timer.repository`
- **Depends on:** Called by `timer.controller.js`

## Notes

- The `elapsedSeconds` calculation is performed in JavaScript after fetching the timestamps from the database. Alternative: MySQL could compute it, but doing it in the service gives control over rounding.
- `getTotalSeconds()` uses `COALESCE(stopped_at, NOW())` in SQL, so running timers are counted from start to current moment.
