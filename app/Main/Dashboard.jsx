'use client'
import { useState } from "react";
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

  const addPersonField = () => {
    setNewPersons([...newPersons, { name: "", amount: "" }]);
  };

  const removePersonField = (index) => {
    const updatedPersons = [...newPersons];
    updatedPersons.splice(index, 1);
    setNewPersons(updatedPersons);
  };

  const addConvenience = () => {
    if (description && amount) {
      const updatedPersons = newPersons.filter(p => p.name !== "");
      const totalShared = updatedPersons.reduce((sum, person) => sum + parseFloat(person.amount || 0), 0);
      const myAmount = parseFloat(amount) - totalShared;
      setConvenienceList([...convenienceList, { description, amount, myAmount, persons: updatedPersons }]);
      setDescription("");
      setAmount("");
      setNewPersons([{ name: "", amount: "" }]);
    }
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
          <h2 className="text-lg font-semibold">Add Convenience</h2>
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
          <div className="mt-2">
            <h3 className="font-semibold">Add Persons</h3>
            {newPersons.map((person, index) => (
              <div key={index} className="flex gap-2 mt-2">
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
              </div>
            ))}
            <Button onClick={addPersonField} className="mt-2">[+]</Button>
          </div>
          <Button className="mt-4 bg-green-600" onClick={addConvenience}>
            Save
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
              <h4 className="font-semibold mt-2">Persons</h4>
              {item.persons.map((p, i) => (
                <p key={i}>{p.name}: {p.amount}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
