"use client";
import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import styles from "../styles/accountbook.module.css";

let expensesChart;
let incomesChart;

export default function AccountBook() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [topExpenseCategory, setTopExpenseCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [currentView, setCurrentView] = useState("expense"); // 초기값을 "expense"로 설정

  useEffect(() => {
    updateCharts();
    updateSummary();
    updateTopExpenseCategory();
    registerDeleteButtonEventListeners();
  }, [expenses, incomes, currentView]);

  const registerDeleteButtonEventListeners = () => {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.removeEventListener("click", handleDelete);
      button.addEventListener("click", handleDelete);
    });
  };

  const addTransaction = (type) => {
    const amountInput = document.getElementById(
      `amount${type.charAt(0).toUpperCase() + type.slice(1)}`
    ).value;
    const categoryInput = document.getElementById(
      `category${type.charAt(0).toUpperCase() + type.slice(1)}`
    ).value;
    const memoInput = document.getElementById(
      `memo${type.charAt(0).toUpperCase() + type.slice(1)}`
    ).value;
    const amount = amountInput;
    const category = categoryInput;
    const memo = memoInput;
    const time = new Date();

    if (!amount || !category) {
      alert("금액과 카테고리를 입력해주세요.");
      return;
    }

    const formattedTime = time.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const transactionId = time.getTime();
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", transactionId);
    newRow.innerHTML = `
      <td class="text-center">${formattedTime}</td>
      <td class="text-center">${amount}원</td>
      <td class="text-center">${category}</td>
      <td class="text-center">${memo}</td>
      <td class="text-center"><button class="delete-btn" data-type="${type}" data-id="${transactionId}">삭제</button></td>
    `;

    if (type === "expense") {
      document.getElementById("expenseList").appendChild(newRow);
      setExpenses((prevExpenses) => {
        const newExpenses = [
          ...prevExpenses,
          {
            time: time,
            amount: amountInput,
            category: categoryInput,
            memo: memoInput,
            id: transactionId,
          },
        ];
        updateSummary(newExpenses, incomes);
        return newExpenses;
      });
    } else if (type === "income") {
      document.getElementById("incomeList").appendChild(newRow);
      setIncomes((prevIncomes) => {
        const newIncomes = [
          ...prevIncomes,
          {
            time: time,
            amount: amountInput,
            category: categoryInput,
            memo: memoInput,
            id: transactionId,
          },
        ];
        updateSummary(expenses, newIncomes);
        return newIncomes;
      });
    }

    setIsModalOpen(false);
    updateCharts();
    updateTopExpenseCategory();
  };

  useEffect(() => {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDelete);
    });

    return () => {
      deleteButtons.forEach((button) => {
        button.removeEventListener("click", handleDelete);
      });
    };
  }, [expenses, incomes]);

  const handleDelete = (event) => {
    const button = event.target;
    const type = button.getAttribute("data-type");
    const transactionId = parseInt(button.getAttribute("data-id"), 10);
    deleteTransaction(button, type, transactionId);
  };

  const deleteTransaction = (button, type, transactionId) => {
    const row = button.closest("tr");
    if (!row) {
      console.error("Delete button clicked, but corresponding row not found.");
      return;
    }

    row.parentNode.removeChild(row);

    if (type === "expense") {
      setExpenses((prevExpenses) => {
        const updatedExpenses = prevExpenses.filter(
          (expense) => expense.id !== transactionId
        );
        updateSummary();
        updateCharts();
        updateTopExpenseCategory();
        return updatedExpenses;
      });
    } else if (type === "income") {
      setIncomes((prevIncomes) => {
        const updatedIncomes = prevIncomes.filter(
          (income) => income.id !== transactionId
        );
        updateSummary();
        updateCharts();
        return updatedIncomes;
      });
    }
  };

  const filterTransactions = (type) => {
    const filter = document.getElementById(
      `filter${type.charAt(0).toUpperCase() + type.slice(1)}`
    ).value;
    const list = type === "expense" ? expenses : incomes;
    const listElement = document.getElementById(`${type}List`);

    while (listElement.firstChild) {
      listElement.removeChild(listElement.firstChild);
    }

    let sortedList = [...list];

    if (filter === "money") {
      sortedList.sort(
        (a, b) =>
          parseFloat(a.amount.replace(/\D/g, "")) -
          parseFloat(b.amount.replace(/\D/g, ""))
      );
    } else if (filter === "time") {
      sortedList.sort((a, b) => a.time - b.time);
    } else if (filter === "category") {
      sortedList.sort((a, b) => a.category.localeCompare(b.category));
    }

    sortedList.forEach((item) => {
      const newRow = document.createElement("tr");
      const formattedTime = item.time.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      newRow.innerHTML = `
        <td class="text-center">${formattedTime}</td>
        <td class="text-center">${item.amount}원</td>
        <td class="text-center">${item.category}</td>
        <td class="text-center">${item.memo}</td>
        <td class="text-center"><button class="delete-btn" data-type="${type}" data-id="${item.id}">삭제</button></td>
      `;
      listElement.appendChild(newRow);
    });

    updateSummary();
    updateCharts();
    registerDeleteButtonEventListeners();
  };

  const updateSummary = () => {
    const totalExpense = expenses.reduce(
      (acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")),
      0
    );
    const totalIncome = incomes.reduce(
      (acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")),
      0
    );
    
    const totalExpenseElement = document.getElementById("totalExpense");
    const totalIncomeElement = document.getElementById("totalIncome");

    if (totalExpenseElement) {
        totalExpenseElement.textContent = formatAmount(totalExpense) + "원";
      }
      if (totalIncomeElement) {
        totalIncomeElement.textContent = formatAmount(totalIncome) + "원";
      }
  };

  const updateTopExpenseCategory = () => {
    const categoryTotals = expenses.reduce((acc, cur) => {
      acc[cur.category] =
        (acc[cur.category] || 0) + parseFloat(cur.amount.replace(/\D/g, ""));
      return acc;
    }, {});

    let topCategory = "";
    let maxAmount = 0;

    for (const category in categoryTotals) {
      if (categoryTotals[category] > maxAmount) {
        maxAmount = categoryTotals[category];
        topCategory = category;
      }
    }

    setTopExpenseCategory(topCategory);
  };

  const generateColors = (numColors) => {
    const colors = [
      "#87CEEB",
      "#00FFFF",
      "#7FFFD4",
      "#98FB98",
      "#3CB371",
      "#2E8B57",
      "#20B2AA",
      "#66CDAA",
      "#8FBC8F",
      "#556B2F",
      "#6B8E23",
      "#9ACD32",
    ];
    return colors.slice(0, numColors);
  };

  const updateCharts = () => {
    if (expensesChart) {
      expensesChart.destroy();
    }
    if (incomesChart) {
      incomesChart.destroy();
    }

    // 지출 차트 요소 확인
    const expenseElement = document.getElementById("expenseChart");
    const expenseCtx = expenseElement ? expenseElement.getContext("2d") : null;

    // 수입 차트 요소 확인
    const incomeElement = document.getElementById("incomeChart");
    const incomeCtx = incomeElement ? incomeElement.getContext("2d") : null;

    if (expenseCtx) {
        const expenseCategories = [...new Set(expenses.map(expense => expense.category))];
        const expenseData = expenseCategories.map(category =>
          expenses.filter(expense => expense.category === category).reduce(
            (acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")),
            0
          )
        );
  
        expensesChart = new Chart(expenseCtx, {
          type: "pie",
          data: {
              labels: expenseCategories,
              datasets: [{
                  label: "지출",
                  data: expenseData,
                  backgroundColor: generateColors(expenseCategories.length),
                  borderWidth: 1,
              }],
          },
          options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ": " + context.raw.toLocaleString() + "원";
                      },
                },
              },
            },
          },
        });
      }
  
      if (incomeCtx) {
        const incomeCategories = [...new Set(incomes.map(income => income.category))];
        const incomeData = incomeCategories.map(category =>
          incomes.filter(income => income.category === category).reduce(
            (acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")),
            0
          )
        );
  
        incomesChart = new Chart(incomeCtx, {
          type: "pie",
          data: {
              labels: incomeCategories,
              datasets: [{
                  label: "수입",
                  data: incomeData,
                  backgroundColor: generateColors(incomeCategories.length),
                  borderWidth: 1,
              }],
          },
          options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ": " + context.raw.toLocaleString() + "원";
                      },
                },
              },
            },
          },
        });
      }
  };

  
  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-custom-green-light flex flex-col items-center p-4 md:p-8">
    <div className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">To-Don List</div>
    <div>
      <button onClick={() => setCurrentView("expense")}>지출 보기</button>
      <button onClick={() => setCurrentView("income")}>수입 보기</button>
    </div>

    {currentView === "expense" && (
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 md:p-6 mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <h2 className="text-lg md:text-xl font-semibold mr-2">지출 내역</h2>
            <select
              id="filterExpense"
              onChange={() => filterTransactions("expense")}
              className="border border-gray-400 rounded-md p-1 mr-2 text-sm md:text-base"
            >
              <option value="time">시간순</option>
              <option value="money">금액순</option>
              <option value="category">카테고리순</option>
            </select>
            <button
              className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base"
              onClick={() => {
                setIsModalOpen(true);
                setTransactionType("expense");
              }}
            >
              추가
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">총 지출</h2>
            <div id="totalExpense" className="text-xl md:text-2xl font-bold">0원</div>
          </div>
        </div>
        <div id="expenseList">지출 내역</div>
        <canvas id="expenseChart"></canvas>
      </div>
    )}

    {currentView === "income" && (
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 md:p-6 mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <h2 className="text-lg md:text-xl font-semibold mr-2">수입 내역</h2>
            <select
              id="filterIncome"
              onChange={() => filterTransactions("income")}
              className="border border-gray-400 rounded-md p-1 mr-2 text-sm md:text-base"
            >
              <option value="time">시간순</option>
              <option value="money">금액순</option>
              <option value="category">카테고리순</option>
            </select>
            <button
              className="bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base"
              onClick={() => {
                setIsModalOpen(true);
                setTransactionType("income");
              }}
            >
              추가
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">총 수입</h2>
            <div id="totalIncome" className="text-xl md:text-2xl font-bold">0원</div>
          </div>
        </div>
        <div id="incomeList">수입 내역</div>
        <canvas id="incomeChart"></canvas>
      </div>
    )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 mx-auto">
            <h2 className="text-lg sm:text-xl mb-4">{transactionType === "expense" ? "지출 추가" : "수입 추가"}</h2>
            <label className="block mb-2">
              금액:
              <input type="text" id={`amount${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`} className="border border-gray-400 rounded-md p-2 w-full" />
            </label>
            <label className="block mb-2">
              카테고리:
              <select id={`category${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`} className="border border-gray-400 rounded-md p-2 w-full">
                <option value="">카테고리 선택</option>
                {transactionType === "expense" ? (
                  <>
                    <option value="식비">식비</option>
                    <option value="교통비">교통비</option>
                    <option value="생필품">생필품</option>
                    <option value="의류">의류</option>
                    <option value="교육">교육</option>
                    <option value="의료 / 건강">의료 / 건강</option>
                    <option value="문화생활">문화생활</option>
                    <option value="미용">미용</option>
                    <option value="저축">저축</option>
                    <option value="공과금">공과금</option>
                    <option value="경조사">경조사</option>
                    <option value="기타">기타</option>
                  </>
                ) : (
                  <>
                    <option value="월급">월급</option>
                    <option value="부수입">부수입</option>
                    <option value="용돈">용돈</option>
                    <option value="보너스">보너스</option>
                    <option value="기타">기타</option>
                  </>
                )}
              </select>
            </label>
            <label className="block mb-4">
              메모:
              <input type="text" id={`memo${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`} className="border border-gray-400 rounded-md p-2 w-full" />
            </label>
            <div className="text-right">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                onClick={() => addTransaction(transactionType)}
              >
                {transactionType === "expense" ? "지출 추가" : "수입 추가"}
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
     )}
     </div>
   );
 }