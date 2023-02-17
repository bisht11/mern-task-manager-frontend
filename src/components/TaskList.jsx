import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Task from "./Task";
import TaskForm from "./TaskForm";
import axios from "axios";
import { URL } from "../App";
import loadingImg from "../assets/loader.gif";

const TaskList = () => {
  // state to handle task(s)
  const [tasks, setTasks] = useState([]);

  // state to handle task status
  const [completedTasks, setCompletedTasks] = useState([]);

  // state to handle DB loading time
  const [isLoading, setIsLoading] = useState(false);

  // states of editing
  const [isEditing, setIsEditing] = useState(false);
  const [taskId, setTaskId] = useState("");

  // state to handle form data
  const [formData, setFormData] = useState({
    // initial form data
    name: "",
    completed: false,
  });
  const { name } = formData;

  // change form data wrt input provided
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // function to get all the tasks (frontend)
  const getTasks = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${URL}/api/tasks`); // send get request to get data (tasks) from server
      setTasks(data); // set task data
      setIsLoading(false);
    } catch (error) {
      toast.error("error.message");
      setIsLoading(false);
    }
  };
  // task loading
  useEffect(() => {
    getTasks();
  }, []);

  // function to add a task (from frontend)
  const createTask = async (e) => {
    e.preventDefault();
    // console.log(formData);
    if (name === "") {
      return toast.error("Input field can not be empty!");
    }
    try {
      await axios.post(`${URL}/api/tasks`, formData); // send a post request and add task to DB
      toast.success("Successfully added, Refresh to see the changes! ");
      setFormData({ ...formData, name: "" }); // clear form after data submission
      getTasks();
    } catch (error) {
      toast.error(error.message); // error pop up
    }
  };

  // function to delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${URL}/api/tasks/${id}`); // send a delete request to backend
      getTasks();
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // show completed tasks
  useEffect(() => {
    // filter out the completed task(s) number
    const cTasks = tasks.filter((task) => {
      return task.completed === true;
    });
    setCompletedTasks(cTasks);
  }, [tasks]); // runs everytime when tasks change

  // get a single task to edit
  const getSingleTask = async (task) => {
    setFormData({ name: task.name, completed: false }); // set task data to form data
    setTaskId(task._id);
    setIsEditing(true);
  };

  // function to update a task
  const updateTask = async (e) => {
    e.preventDefault();
    if (name === "") {
      return toast.error("Input field can not be empty!");
    }
    try {
      await axios.put(`${URL}/api/tasks/${taskId}`, formData);
      setFormData({ ...formData, name: "" }); // clear form field
      setIsEditing(false);
      getTasks(); // refresh tasks (frontend)
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to mark tasks as completed
  const setToComplete = async (task) => {
    // formdata with staus completed true
    const newFormData = {
      name: task.name,
      completed: true,
    };
    try {
      await axios.put(`${URL}/api/tasks/${task._id}`, newFormData); //update the completed status
      getTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h2>Task Manager</h2>
      <TaskForm
        name={name}
        handleInputChange={handleInputChange}
        createTask={createTask}
        isEditing={isEditing}
        updateTask={updateTask}
      />
      {/*  show counter when atleast a single task is avaiable */}
      {tasks.length > 0 && (
        <div className="--flex-between --pb">
          <p>
            <b>Total Tasks: </b> {tasks.length}
          </p>
          <p>
            <b>Completed Tasks:</b> {completedTasks.length}
          </p>
        </div>
      )}
      <hr />
      {isLoading && (
        <div className="--flex-center">
          <img src={loadingImg} alt="Loading" />
        </div>
      )}
      {!isLoading && tasks.lenght === 0 ? (
        <p className="--py">No task added. Please add a task.</p>
      ) : (
        <>
          {tasks.map((task, index) => {
            return (
              <Task
                key={task._id}
                task={task}
                index={index}
                deleteTask={deleteTask}
                getSingleTask={getSingleTask}
                setToComplete={setToComplete}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default TaskList;
