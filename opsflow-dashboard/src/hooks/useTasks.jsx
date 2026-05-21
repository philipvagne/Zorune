import { useEffect, useState } from "react";
import api from "../api";
import { createSocket } from "../socket";

export default function useTasks(token) {
  const [tasks, setTasks] = useState([]);

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks([...res.data.data]);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  // UPDATE STATUS
  const updateTaskStatus = async (
    taskId,
    newStatus
  ) => {
    try {
      await api.patch(
        `/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus }
            : t
        )
      );
    } catch (err) {
      console.error(
        "Failed to update status:",
        err
      );
    }
  };

  // ASSIGN TASK
  const assignTask = async (
    taskId,
    assigneeId
  ) => {
    try {
      await api.patch(
        `/tasks/${taskId}/assign`,
        { assigneeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, assigneeId }
            : t
        )
      );
    } catch (err) {
      console.error(
        "Failed to assign task:",
        err
      );
    }
  };

  // SOCKETS
  useEffect(() => {
    fetchTasks();

    const socket = createSocket(token);

    socket.on("notification", (data) => {
      if (data.type === "TASK_ASSIGNED") {
        fetchTasks();
      }
    });

    socket.on("task_updated", () => {
      fetchTasks();
    });

    return () => socket.disconnect();
  }, [token]);

  // GROUP TASKS
  const todoTasks = tasks.filter(
    (t) => t.status === "TODO"
  );

  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  );

  const doneTasks = tasks.filter(
    (t) => t.status === "DONE"
  );

  return {
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    fetchTasks,
    updateTaskStatus,
    assignTask,
  };
}