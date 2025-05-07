import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Loader from "./utils/Loader";
import Tooltip from "./utils/Tooltip";

const Tasks = () => {
  const authState = useSelector((state) => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [fetchData, { loading }] = useFetch();

  const fetchTasks = useCallback(() => {
    const config = {
      url: "/tasks",
      method: "get",
      headers: { Authorization: authState.token },
    };
    fetchData(config, { showSuccessToast: false }).then((data) =>
      setTasks(data.tasks)
    );
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = {
      url: `/tasks/${id}`,
      method: "delete",
      headers: { Authorization: authState.token },
    };
    fetchData(config).then(() => fetchTasks());
  };

  const handleStatusChange = (id, newStatus, task) => {
    const updatedTasks = tasks.map((t) =>
      t._id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    const config = {
      url: `/tasks/${id}`,
      method: "put",
      data: {
        status: newStatus,
        description: task.description,
        title: task.title,
        priority: task.priority,
      },
      headers: { Authorization: authState.token },
    };

    fetchData(config, { showSuccessToast: false }).then(() => fetchTasks());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="my-2 mx-auto max-w-[900px] py-4">
        <div className="flex justify-between items-center mb-4">
          {tasks.length !== 0 && (
            <h2 className="my-2 ml-2 md:ml-0 text-xl">
              Your tasks ({tasks.length})
            </h2>
          )}
          <Link
            to="/tasks/add"
            className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2"
          >
            + Add new task
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div>
            {tasks.length === 0 ? (
              <div className="w-full h-[300px] flex items-center justify-center gap-4">
                <span>No tasks found</span>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task._id}
                  className="bg-white my-4 p-4 text-gray-600 rounded-md shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-lg">
                        {task.title || `Task #${index + 1}`}
                      </span>
                      <span
                        className={`ml-4 font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Medium"} Priority
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="mr-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={task.status === "complete"}
                            onChange={() =>
                              handleStatusChange(
                                task._id,
                                task.status === "complete"
                                  ? "incomplete"
                                  : "complete"
                              )
                            }
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ms-3 text-sm font-medium text-gray-900 ml-2">
                            {task.status === "complete"
                              ? "Complete"
                              : "Incomplete"}
                          </span>
                        </label>
                      </div>

                      <Tooltip text={"Edit this task"} position={"top"}>
                        <Link
                          to={`/tasks/${task._id}`}
                          className="mr-2 text-green-600 cursor-pointer"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </Link>
                      </Tooltip>

                      <Tooltip text={"Delete this task"} position={"top"}>
                        <span
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleDelete(task._id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </span>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap mb-2">
                    {task.description}
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {formatDate(task.createdAt || new Date())}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
