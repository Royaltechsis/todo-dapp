import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";
import './App.css';

const contractAddress = "0xFEBc0A5717cB2957e09Cb44ddD0E76Be45bF656B";
const contractABI = abi;

export default function TaskApp() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskText, setTaskText] = useState("");
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        connectWallet();
    }, []);

    async function connectWallet() {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const userAccount = await signer.getAddress();
                setAccount(userAccount);

                const taskContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(taskContract);

                console.log("Wallet connected:", userAccount);
                console.log("Contract:", taskContract);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            console.error("MetaMask is not installed");
        }
    }

    async function fetchTasks(taskContract) {
        if (!taskContract) return;
        try {
            const myTasks = await taskContract.getMyTask();
            setTasks(myTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }

    async function addTask() {
        if (!taskTitle || !taskText) {
            console.error("Task title and description are required");
            return;
        }

        if (contract) {
            try {
                const tx = await contract.addTask(taskTitle, taskText);
                await tx.wait();
                console.log("Task added:", tx);
                fetchTasks(contract);
                setTaskTitle("");
                setTaskText("");
            } catch (error) {
                console.error("Failed to add task:", error);
            }
        }
    }

    async function deleteTask(taskId) {
        if (contract) {
            try {
                const tx = await contract.deleteTask(taskId);
                await tx.wait();
                console.log("Task deleted:", tx);
                fetchTasks(contract);
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        }
    }

    return (
        <div className="container">
            <h1 className="title">Task Manager</h1>
            {account ? (
                <p>Connected as: {account}</p>
            ) : (
                <button onClick={connectWallet} className="connect-button">
                    Connect Wallet
                </button>
            )}
            <div className="task-inputs">
                <input
                    className="input"
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                />
                <textarea
                    className="textarea"
                    placeholder="Task Description"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                />
                <button onClick={addTask} className="add-button">
                    Add Task
                </button>
            </div>
            <div>
                <h2 className="tasks-title">My Tasks</h2>
                {tasks.map((task, index) => (
                    <div key={index} className="task">
                        <h3 className="task-title">{task.taskTitle}</h3>
                        <p>{task.taskText}</p>
                        <button onClick={() => deleteTask(task.id)} className="delete-button">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
