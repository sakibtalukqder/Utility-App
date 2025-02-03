'use client'
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard() {
    const [convenienceList, setConvenienceList] = useState([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [persons, setPersons] = useState([]);
    const [newPersons, setNewPersons] = useState([{ name: "", amount: "" }]);
    const [editMode, setEditMode] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);  // Current date in YYYY-MM-DD format

    // Fetch convenience data from backend
    useEffect(() => {
        fetch("http://localhost:5000/conveniences")
            .then((response) => response.json())
            .then((data) => setConvenienceList(data));
    }, []);

    const addPersonField = () => {
        setNewPersons([...newPersons, { name: "", amount: "" }]);
    };

    const removePersonField = (index) => {
        const updatedPersons = [...newPersons];
        updatedPersons.splice(index, 1);
        setNewPersons(updatedPersons);
    };

    const handleAddConvenience = () => {
        if (description && amount) {
            const updatedPersons = newPersons.filter(p => p.name !== "");
            const totalShared = updatedPersons.reduce((sum, person) => sum + parseFloat(person.amount || 0), 0);
            const myAmount = parseFloat(amount) - totalShared;

            const newConvenience = { description, amount, myAmount, persons: updatedPersons, date };

            // Save to backend
            fetch("http://localhost:5000/conveniences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newConvenience),
            })
                .then((response) => response.json())
                .then((data) => {
                    setConvenienceList([...convenienceList, data]);
                    setDescription("");
                    setAmount("");
                    setNewPersons([{ name: "", amount: "" }]);
                    setDate(new Date().toISOString().split("T")[0]);  // Reset date to today
                });
        }
    };

    const handleEditConvenience = () => {
        if (description && amount && editMode) {
            const updatedPersons = newPersons.filter(p => p.name !== "");
            const totalShared = updatedPersons.reduce((sum, person) => sum + parseFloat(person.amount || 0), 0);
            const myAmount = parseFloat(amount) - totalShared;

            const updatedConvenience = { ...editMode, description, amount, myAmount, persons: updatedPersons, date };

            // Update to backend
            fetch(`http://localhost:5000/conveniences/${editMode.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedConvenience),
            })
                .then((response) => response.json())
                .then((data) => {
                    const updatedList = convenienceList.map((item) =>
                        item.id === data.id ? data : item
                    );
                    setConvenienceList(updatedList);
                    setDescription("");
                    setAmount("");
                    setNewPersons([{ name: "", amount: "" }]);
                    setDate(new Date().toISOString().split("T")[0]);  // Reset date to today
                    setEditMode(null);
                });
        }
    };

    const handleDeleteConvenience = (id) => {
        // Delete from backend
        fetch(`http://localhost:5000/conveniences/${id}`, {
            method: "DELETE",
        })
            .then(() => {
                const updatedList = convenienceList.filter((item) => item.id !== id);
                setConvenienceList(updatedList);
            });
    };

    const expenseSummary = convenienceList.reduce((summary, item) => {
        summary["My Expense"] = (summary["My Expense"] || 0) + item.myAmount;
        item.persons.forEach(person => {
            summary[person.name] = (summary[person.name] || 0) + parseFloat(person.amount);
        });
        return summary;
    }, {});

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
            <Card className="mt-4 p-4 bg-white shadow-md rounded-2xl">
                <CardContent>
                    <h2 className="text-lg font-semibold">Summary</h2>
                    {Object.entries(expenseSummary).map(([name, total], index) => (
                        <p key={index} className="text-xl font-bold text-green-600">{name}: {total}</p>
                    ))}
                </CardContent>
            </Card>
            <Card className="mt-4 p-4 bg-white shadow-md rounded-2xl">
                <CardContent>
                    <h2 className="text-lg font-semibold">{editMode ? "Edit Convenience" : "Add Convenience"}</h2>
                    <Input
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2"
                    />
                    <Input
                        placeholder="Total Amount (Yours if no person added)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-2"
                    />
                    <Input
                        placeholder="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-2"
                    />




                    <div className="mt-2">
                        <h3 className="font-semibold">Add Persons</h3>

                        {newPersons.map((person, index) => (
                            <div key={index} className="flex gap-2 mt-2 items-center justify-center">
                                <Input
                                    placeholder="Name"
                                    value={person.name}
                                    onChange={(e) => {
                                        const updated = [...newPersons];
                                        updated[index].name = e.target.value;
                                        setNewPersons(updated);
                                    }}
                                />
                                <Input
                                    placeholder="Amount"
                                    type="number"
                                    value={person.amount}
                                    onChange={(e) => {
                                        const updated = [...newPersons];
                                        updated[index].amount = e.target.value;
                                        setNewPersons(updated);
                                    }}
                                />
                                <Button onClick={() => removePersonField(index)}>X</Button>
                                <Button onClick={addPersonField} >+</Button>
                            </div>
                        ))}

                        {
                            newPersons == 0 ? <>
                                <Button onClick={addPersonField} className="mt-2">[+]</Button>
                            </> : ""
                        }

                    </div>






                    <Button
                        className="mt-4 bg-green-600"
                        onClick={editMode ? handleEditConvenience : handleAddConvenience}
                    >
                        {editMode ? "Save Changes" : "Save"}
                    </Button>
                </CardContent>
            </Card>
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Convenience List</h2>
                {convenienceList.map((item, index) => (
                    <Card key={index} className="mt-2 p-4 bg-white shadow-md rounded-2xl">
                        <CardContent>
                            <p className="font-semibold">{item.description}</p>
                            <p>Total Amount: {item.amount}</p>
                            <p className="font-semibold text-blue-600">My Expense: {item.myAmount}</p>
                            <p className="text-sm text-gray-600">Date: {item.date}</p>
                            <h4 className="font-semibold mt-2">Persons</h4>
                            {item.persons.map((p, i) => (
                                <p key={i}>{p.name}: {p.amount}</p>
                            ))}
                            <div className="flex gap-2 mt-4">
                                <Button onClick={() => {
                                    setEditMode(item);
                                    setDescription(item.description);
                                    setAmount(item.amount);
                                    setDate(item.date);
                                    setNewPersons(item.persons.map(p => ({ name: p.name, amount: p.amount })));
                                }}>
                                    Edit
                                </Button>
                                <Button onClick={() => handleDeleteConvenience(item.id)} className="bg-red-600">
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
