import { useEffect, useState } from "react";
import useTasks from "../hooks/useTasks";
import NotificationBell from "../components/notifications/NotificationBell";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TaskModal from "../components/tasks/TaskModal";
import TopBar from "../components/dashboard/TopBar";
import LeftRail from "../components/dashboard/LeftRail";
import CenterWorkspace from "../components/dashboard/CenterWorkspace";
import RightRail from "../components/dashboard/RightRail";
import ContextPanel from "../components/dashboard/ContextPanel";
import api from "../api";
import { createSocket } from "../socket";
import toast from "react-hot-toast";

export default function Dashboard({ token, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  const {
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    updateTaskStatus,
    updateTaskDueDate,
    assignTask,
    removeAssignee,
    archiveTask,
  } = useTasks(token);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || null;

  const selectTask = (task) => {
    setSelectedTaskId(task.id);
  };

useEffect(() => {
  fetchNotifications();

  const socket = createSocket(token);

  socket.on("notification", (data) => {
    toast.success(data.message);

    const normalized = {
      id: data.id || data.notificationId,
      message: data.message,
      type: data.type,
      taskId: data.taskId,
      isRead: data.isRead ?? false,
    };

    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.id === normalized.id
      );

      if (exists) return prev;

      return [normalized, ...prev];
    });
  });

  return () => socket.disconnect();
}, [token]);

  // CLICK OUTSIDE CLOSE
  useEffect(() => {
    const handleClickOutside = () => {
      if (openNotifications) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside
      );
    };
  }, [openNotifications]);

  useEffect(() => {
  const handleEsc = (event) => {
    if (event.key === "Escape") {
      setSelectedTaskId(null);
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, []);

useEffect(() => {
  if (selectedTaskId && !selectedTask) {
    setSelectedTaskId(null);
  }
}, [selectedTaskId, selectedTask]);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await api.get(
        "/tasks/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch notifications:",
        err
      );
    }
  };

  // MARK AS READ
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update local state instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(
        `/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );
    }
  };

return (
  <div className="dashboard-shell">
    <TopBar
      title="Dashboard"
      actions={
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      }
    />

    <div className="dashboard-body">
      <LeftRail />

      <div className="dashboard-workspace-stack">
        <CenterWorkspace>
          <div className="kanban-board">
            <KanbanColumn
              title="TODO"
              tasks={todoTasks}
              setSelectedTask={selectTask}
            />

            <KanbanColumn
              title="IN PROGRESS"
              tasks={inProgressTasks}
              setSelectedTask={selectTask}
            />

            <KanbanColumn
              title="DONE"
              tasks={doneTasks}
              setSelectedTask={selectTask}
            />
          </div>
        </CenterWorkspace>

        <ContextPanel>
          {selectedTask && (
            <TaskModal
              task={selectedTask}
              onClose={() => setSelectedTaskId(null)}
              token={token}
              updateTaskStatus={updateTaskStatus}
              updateTaskDueDate={updateTaskDueDate}
              assignTask={assignTask}
              removeAssignee={removeAssignee}
              archiveTask={archiveTask}
            />
          )}
        </ContextPanel>
      </div>

      <RightRail>
        <NotificationBell
          notifications={notifications}
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
        />
      </RightRail>
    </div>
  </div>
);
}
