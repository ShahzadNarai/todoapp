import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@mui/joy/CircularProgress";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { DragDropContext } from '@hello-pangea/dnd'
import { Droppable } from '@hello-pangea/dnd'
import { Draggable } from '@hello-pangea/dnd'

export default function Home({ value = 75 }) {
  const [todo, setTodo] = useState("");
  const [limitHours, setLimitHours] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) setTodos(JSON.parse(storedTodos));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodos((prev) =>
        prev.map((item) =>
          item.isRunning ? { ...item, elapsed: item.elapsed + 1 } : item
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTodo = () => {
    if (!limitHours) {
      setError("Please enter time limit.");
      return;
    }
    if (todo.trim() === "" || limitHours.trim() === "") return;

    const limitSeconds = Number(limitHours) * 3600;

    const newTodo = {
      id: uuidv4(),
      todo,
      limit: limitSeconds,
      elapsed: 0,
      progress: false,
      notStarted: false,
      isRunning: false,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setTodo("");
    setLimitHours("");
    setShow(false);
  };

  const handleEdit = (id) => {
    const t = todos.find((i) => i.id === id);
    setTodo(t.todo);
    setLimitHours(t.limit / 3600);
    setEditId(id);
    setOpenDropdown(null);
    setShow(true);
  };

  const handleUpdateTodo = () => {
    if (!limitHours) {
      setError("Please enter time limit.");
      return;
    }
    const updatedTodos = todos.map((item) =>
      item.id === editId
        ? { ...item, todo, limit: Number(limitHours) * 3600 }
        : item
    );
    setTodos(updatedTodos);
    setTodo("");
    setLimitHours("");
    setEditId(null);
    setShow(false);
  };

  const handleDelete = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
    setOpenDropdown(null);
  };

  const handleToggleComplete = (id) => {
    setTodos(
      todos.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: true,
              stuck: false,
              progress: false,
              isRunning: false,
            }
          : item
      )
    );
    setOpenDropdown(null);
  };

  const handleProgress = (id) => {
    setTodos(
      todos.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: false,
              progress: true,
              isRunning: true,
            }
          : item
      )
    );
    setOpenDropdown(null);
  };

  const handlePauseResume = (id) => {
    setTodos(
      todos.map((item) =>
        item.id === id
          ? { ...item, progress: true, isRunning: !item.isRunning }
          : item
      )
    );
    setOpenDropdown(null);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getBgColor = (item) => {
    if (item.completed)
      return item.elapsed > item.limit ? "bg-red-300" : "bg-green-300";
    if (item.progress) return "bg-blue-300";
    return "bg-white";
  };

  const onToggleShow = () => setShow(!show);
  const onToggledropdown = (id) =>
    setOpenDropdown(openDropdown === id ? null : id);

  const filteredTodos = todos.filter((item) => item.completed);
  const todosFil = todos.filter((item) => !item.completed);

  const totalTasks = todos.length;
  const completedTasks = filteredTodos.length;
  const inProgressTasks = todos.filter(
    (t) => t.progress && !t.completed
  ).length;
  const notStartedTasks = todos.filter(
    (t) => !t.completed && !t.progress && !t.stuck
  ).length;

  const completedPercent =
    totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const progressPercent =
    totalTasks === 0 ? 0 : (inProgressTasks / totalTasks) * 100;
  const notStartedPercent =
    totalTasks === 0 ? 0 : (notStartedTasks / totalTasks) * 100;

  // Handle Drag and Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    let items = [...todos];
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    setTodos(items);
  };

  return (
    <>
      <Navbar />
      <div className="container px-5 py-24 mx-auto flex flex-wrap relative">
        <div
          className="lg:w-1/2 mb-10 lg:mb-0 overflow-hidden overflow-y-auto flex relative flex-wrap p-8 text-center rounded-lg justify-center w-full"
          style={{ boxShadow: "0px 2px 10px 5px rgba(0,0,0,0.2)" }}
        >
          {show && (
            <div className="flex flex-col md:flex-row absolute justify-center items-center min-w-full max-w-full md:min-w-[600px] md:max-w-[600px] p-4 top-20 left-0 md:top-[8%] md:left-8 h-52 z-20 bg-white shadow-lg rounded-lg gap-2">
              <input
                onChange={(e) => setTodo(e.target.value)}
                value={todo}
                className="border bg-green-100 rounded-sm px-2"
                placeholder="Task name"
              />
              <input
                onChange={(e) => {
                  setLimitHours(e.target.value);
                  setError("");
                }}
                value={limitHours}
                type="number"
                required
                className="border bg-blue-100 rounded-sm px-2 md:w-28"
                placeholder="Hours"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={editId ? handleUpdateTodo : handleAddTodo}
                disabled={!todo || !limitHours}
                className="border disabled:bg-red-200 disabled:text-gray-400 rounded bg-green-300 px-2 mx-2 "
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          )}

          <div className="flex relative justify-between items-center w-full">
            <span className="absolute top-0 -left-6 lg:-left-6">
              <NoteAddOutlinedIcon sx={{ color: "#99a1af" }} />
            </span>
            <h1 className="text-sm text-red-400 font-semibold ml-1">To-Do</h1>
            <div
              onClick={onToggleShow}
              className="mx-2 flex justify-center items-center cursor-pointer text-gray-400"
            >
              <span className="text-red-400">
                <AddOutlinedIcon />
              </span>
              Add task
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todosDroppable">
              {(provided) => (
                <div
                  className="w-full flex flex-col items-center my-6 rounded-lg h-screen"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todosFil.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="flex flex-wrap w-full p-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex relative justify-between w-full items-center">
                            <div
                              className={`border border-gray-400 w-full flex flex-col px-2 py-2 rounded-lg transition ${getBgColor(
                                item
                              )}`}
                            >
                              <span className="font-bold">{item.todo}</span>
                              <span className="text-sm text-gray-700">
                                Time: {formatTime(item.elapsed)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Limit: {formatTime(item.limit)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Status:{" "}
                                {item.progress
                                  ? "In Progress"
                                  : item.completed
                                  ? "Completed"
                                  : "Not Started"}
                              </span>
                              <button
                                onClick={() => onToggledropdown(item.id)}
                                className="flex items-center cursor-pointer justify-center top-0 right-0 absolute px-3 font-bold text-xl rounded mx-2"
                              >
                                ...
                              </button>
                            </div>
                            {openDropdown === item.id && (
                              <div
                                style={{
                                  boxShadow: "0px 2px 10px 5px rgba(0,0,0,0.2)",
                                }}
                                className="absolute right-0 top-8 bg-white rounded border w-36 z-50"
                              >
                                <button
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                  onClick={() => handlePauseResume(item.id)}
                                >
                                  {item.isRunning ? "Pause" : "Resume"}
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                  onClick={() => handleProgress(item.id)}
                                >
                                  Progress
                                </button>

                                <button
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                  onClick={() => handleToggleComplete(item.id)}
                                >
                                  Completed
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                  onClick={() => handleEdit(item.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div class="flex flex-col flex-wrap w-full lg:w-1/2 lg:pl-12 lg:text-left text-center">
          <div
            style={{ boxShadow: "0px 2px 10px 5px rgba(0, 0, 0, 0.2)" }}
            className="flex flex-col mb-10 lg:items-start items-center lg:py-6 lg:pl-12 lg:text-left p-8 text-center rounded-lg h-[263px]"
          >
            <h1 className="flex justify-start items-center w-full text-sm text-red-400 font-semibold mb-4">
              <span className="mr-1">
                <AssignmentTurnedInOutlinedIcon sx={{ color: "#99a1af" }} />
              </span>
              Task Status
            </h1>

            <div className="flex justify-center items-center bg-gray-100 rounded-lg w-full p-4">
              <div className="flex sm:flex-row flex-col gap-8 w-full">
                {/* Completed */}
                <div className="flex w-full relative flex-col items-center">
                  <CircularProgress
                    determinate
                    color="success"
                    value={completedPercent}
                    size="lg"
                    sx={{
                      "--CircularProgress-size": "100px",
                      "--CircularProgress-progressThickness": "12px",
                      fontSize: "20px",
                    }}
                  />
                  <div className="absolute top-10 text-lg font-bold">
                    {completedPercent.toFixed(1)}%
                  </div>
                  <div className="font-semibold mt-4">
                    <span className="text-[#1F7A1F]">●</span> Completed
                  </div>
                </div>

                {/* In Progress */}
                <div className="flex w-full relative flex-col items-center">
                  <CircularProgress
                    determinate
                    color="primary"
                    value={progressPercent}
                    size="lg"
                    sx={{
                      "--CircularProgress-size": "100px",
                      "--CircularProgress-progressThickness": "12px",
                      fontSize: "20px",
                    }}
                  />
                  <div className="absolute top-10 text-lg font-bold">
                    {progressPercent.toFixed(1)}%
                  </div>

                  <div className="font-semibold mt-4">
                    <span className="text-[#0b6bcb]">●</span> In Progress
                  </div>
                </div>

                {/* Not Started */}
                <div className="flex w-full relative flex-col items-center">
                  <CircularProgress
                    determinate
                    color="danger"
                    value={notStartedPercent}
                    size="lg"
                    sx={{
                      "--CircularProgress-size": "100px",
                      "--CircularProgress-progressThickness": "12px",
                      fontSize: "20px",
                    }}
                  />
                  <div className="absolute top-10 text-lg font-bold">
                    {notStartedPercent.toFixed(1)}%
                  </div>

                  <div className="font-semibold mt-4">
                    <span className="text-[#d32f2f]">●</span> Not Started
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{ boxShadow: "0px 2px 10px 5px rgba(0, 0, 0, 0.2)" }}
            className="flex flex-col mb-10 lg:items-start items-center lg:pl-12 lg:text-left p-8 text-center rounded-lg"
          >
            <h1 className="flex justify-start w-full text-sm text-red-400 font-semibold mb-4">
              Completed Task
            </h1>

            <div className="w-full flex flex-col items-center my-2 rounded-lg ">
              {/* Todo Items */}
              {filteredTodos.map((item) => (
                <div key={item.id} className="flex flex-wrap w-full mt-4">
                  <div className="flex relative justify-between w-full items-center">
                    <div
                      className={`border border-gray-400 w-full flex flex-col px-2 py-2 rounded-lg transition ${getBgColor(
                        item
                      )}`}
                    >
                      <span className="font-bold">{item.todo}</span>

                      {/* Timer */}
                      <span className="text-sm text-gray-700">
                        Time: {formatTime(item.elapsed)}
                      </span>

                      <span className="text-sm text-gray-500">
                        Limit: {formatTime(item.limit)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Status:{" "}
                        {item.progress === true
                          ? "In Progress"
                          : item.completed === true
                          ? "Completed"
                          : "Not Started"}
                      </span>
                      {/* Dropdown button */}
                      <button
                        onClick={() => onToggledropdown(item.id)}
                        className="flex items-center cursor-pointer justify-center top-0 right-0 absolute px-3 font-bold text-xl rounded mx-2"
                      >
                        ...
                      </button>
                    </div>
                    {/* Dropdown */}
                    {openDropdown === item.id && (
                      <div
                        style={{
                          boxShadow: "0px 2px 10px 5px rgba(0, 0, 0, 0.2)",
                        }}
                        className="absolute right-0 top-8 bg-white rounded border w-36 z-50"
                      >
                        <button
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleProgress(item.id)}
                        >
                          Progress
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleToggleComplete(item.id)}
                        >
                          Completed
                        </button>

                        <button
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleEdit(item.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="flex flex-wrap text-center justify-center w-1/2">
          <div className="w-full p-5 flex flex-col items-center bg-gray-100 my-6 mx-8 rounded-lg border h-screen">
            <h1 className="text-3xl pt-12 pb-6 font-bold">Todo App</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCount((count) => count + 1);
                }}
                className="border rounded bg-green-400 px-2 mx-2"
              >
                count is {count}
              </button>
              <div>Magical number is: {magical.index}</div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
