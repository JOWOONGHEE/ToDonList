"use client";
import React, { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import Chart from "chart.js/auto";
import styles from "../styles/accountbook.module.css";

let expensesChart;
let incomesChart;

export default function AccountBook() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [topExpenseCategory, setTopExpenseCategory] = useState("");
  const [topIncomeCategory, setTopIncomeCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState("");
  const [currentView, setCurrentView] = useState("expense"); // 초기값을 "expense"로 설정
  const { data: sessionData, status } = useSession();
  const [dataLoaded, setDataLoaded] = useState(false); // 데이터 로드 상태 추가
  const [showExpenses, setShowExpenses] = useState(true);
  const [showIncomes, setShowIncomes] = useState(true);

 // 세션 데이터가 변경될 때 로컬 스토리지에서 데이터 로드
 useEffect(() => {
    console.log("세션 데이터:", sessionData);
    if (status === 'authenticated' && sessionData && sessionData.user && sessionData.user.email) {
        const userEmail = sessionData.user.email;
        console.log("세션 데이터 있음:", userEmail);
        const savedExpenses = localStorage.getItem(`expenses_${userEmail}`);
        const savedIncomes = localStorage.getItem(`incomes_${userEmail}`);
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedIncomes) setIncomes(JSON.parse(savedIncomes));
        setDataLoaded(true); // 데이터 로드 완료
    } else {
        console.log("세션 데이터 또는 이메일이 없음");
    }
}, [sessionData, status]); // status가 변경될 때마다 실행

// expenses 또는 incomes가 변경될 때 로컬 스토리지에 저장
useEffect(() => {
    if (sessionData && sessionData.user && sessionData.user.email) {
        const userEmail = sessionData.user.email;
        console.log("저장 시도: ", expenses, incomes);
        try {
            localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenses));
            localStorage.setItem(`incomes_${userEmail}`, JSON.stringify(incomes));
        } catch (error) {
            console.error("로컬 스토리지 저장 실패:", error);
        }
    }
}, [expenses, incomes, sessionData]);

  

  useEffect(() => {
    updateCharts();
    updateSummary();
    updateTopExpenseCategory();
    updateTopIncomeCategory();
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
    const timeInput = document.getElementById(`time${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const amount = parseFloat(amountInput);
    const category = categoryInput;
    const memo = memoInput;
    const time = timeInput ? new Date(timeInput) : new Date();
  
    if (!amount || !category) {
      alert("금액과 카테고리를 입력해주세요.");
      return;
    }
  
    const transactionId = new Date().getTime(); // 고유 ID를 밀리초 단위로 생성
    const newTransaction = {
      id: transactionId,
      time: time.toISOString().split('T')[0], // 날짜만 저장
      amount: `${amount}원`,
      category: category,
      memo: memo,
      count: 1,
      type: type
    };
  
    if (type === "expense") {
      setExpenses([...expenses, newTransaction]);
    } else {
      setIncomes([...incomes, newTransaction]);
    }
  
    // updateList 함수를 호출하여 목록을 업데이트
    updateList(type, type === "expense" ? [...expenses, newTransaction] : [...incomes, newTransaction]);
  
    updateCharts();
    updateTopExpenseCategory();
    updateTopIncomeCategory();
    setIsModalOpen(false);
  };
  
  useEffect(() => {
    // currentView가 변경될 때마다 리스트 업데이트
    if (currentView === "expense") {
      updateList('expense', expenses);
    } else {
      updateList('income', incomes);
    }
  }, [currentView, expenses, incomes]); // currentView, expenses, incomes가 변경될 때마다 실행


  const updateList = (type, list = []) => {
    const listElement = document.getElementById(`${type}List`);
    if (!listElement) {
      console.error(`${type}List element not found`);
      return;
    }
    listElement.innerHTML = '';
  
    const categoryMap = new Map();
  
    list.forEach(item => {
      if (categoryMap.has(item.category)) {
        const existing = categoryMap.get(item.category);
        existing.amount += parseFloat(item.amount.replace(/\D/g, ""));
        existing.count += 1;
      } else {
        categoryMap.set(item.category, {
          ...item,
          amount: parseFloat(item.amount.replace(/\D/g, "")),
          count: 1
        });
      }
    });
  
    categoryMap.forEach((item, category) => {
      const newRow = document.createElement("tr");
      const time = new Date(item.time);
      const formattedTime = time instanceof Date && !isNaN(time) ? time.toLocaleDateString("ko-KR") : 'Invalid Date';
  
      newRow.innerHTML = `
        <td class="text-center">${formattedTime}</td>
        <td class="text-center">${item.amount}원 (${item.count}건)</td>
        <td class="text-center">${item.category}</td>
        <td class="text-center"><button class="delete-btn" data-type="${type}" data-id="${item.id}">삭제</button></td>
      `;
      newRow.addEventListener("click", () => showTransactionDetails(item.category, type));
      listElement.appendChild(newRow);
    });
  
    // 삭제 버튼 이벤트 리스너 등록
    registerDeleteButtonEventListeners();
  };

    const showTransactionDetails = (category, type) => {
      const transactions = type === "expense" ? expenses : incomes;
      const filteredTransactions = transactions.filter(transaction => transaction.category === category);
      setSelectedTransactions(filteredTransactions);
      setTransactionType(type); // transactionType 상태 추가
      setIsDetailsModalOpen(true);
    };
  
    useEffect(() => {
      if (isDetailsModalOpen) {
        const modalContent = document.getElementById("transactionDetailsContent");
        if (modalContent) {
          const category = selectedTransactions.length > 0 ? selectedTransactions[0].category : '';
          modalContent.innerHTML = `
            <div style="text-align: center; font-size: 1.2em; font-weight: bold; margin-bottom: 1em;">
              카테고리: ${category}
            </div>
            ${selectedTransactions.map(transaction => `
              <div style="position: relative; margin-bottom: 1em; border-bottom: 1px solid #ccc; padding-bottom: 1em;">
                <button class="delete-btn" data-type="${transaction.type}" data-id="${transaction.id}" 
                style="color: white; background-color: red; border: none; padding: 0.3em 0.6em; border-radius: 5px; float: right; margin-top: 0.1em;">
                삭제
                </button>  
                <p>날짜: ${new Date(transaction.time).toLocaleDateString("ko-KR")}</p>
                <p>금액: ${transaction.amount}</p>
                <p>메모: ${transaction.memo}</p>
                
              </div>
            `).join('')}
          `;
    
          const deleteButtons = modalContent.getElementsByClassName("delete-btn");
          for (let button of deleteButtons) {
            button.addEventListener("click", handleDelete);
          }
        }
      }
    }, [isDetailsModalOpen, selectedTransactions, transactionType]);
  
  

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
    event.stopPropagation(); // 이벤트 전파를 막음
    const type = event.target.getAttribute("data-type");
    const transactionId = parseInt(event.target.getAttribute("data-id"), 10);
    deleteTransaction(type, transactionId);
  };

  const deleteTransaction = (type, transactionId) => {
    if (type === "expense") {
      setExpenses((prevExpenses) => {
        const updatedExpenses = prevExpenses.filter(
          (expense) => expense.id !== transactionId
        );
        updateList(type, updatedExpenses);
        updateSummary(updatedExpenses, incomes);
        updateTopExpenseCategory();
        updateTopIncomeCategory();
        return updatedExpenses;
      });
    } else if (type === "income") {
      setIncomes((prevIncomes) => {
        const updatedIncomes = prevIncomes.filter(
          (income) => income.id !== transactionId
        );
        updateList(type, updatedIncomes);
        updateSummary(expenses, updatedIncomes);
        return updatedIncomes;
      });
    }// 요소가 존재하는지 확인 후 filterTransactions 호출
  
    setSelectedTransactions((prevTransactions) =>
      prevTransactions.filter((t) => t.id !== transactionId)
    );
    filterTransactions(type);
    updateCharts();
    updateTopExpenseCategory();
    updateTopIncomeCategory();
  };

  const filterTransactions = (type) => {
    const filterElement = document.getElementById(
      `filter${type.charAt(0).toUpperCase() + type.slice(1)}`
    );
    const filter = filterElement ? filterElement.value : "default"; // 요소가 존재하지 않을 경우 기본값 사용
    const list = type === "expense" ? expenses : incomes;
    const listElement = document.getElementById(`${type}List`);
    if (!listElement) {
      console.error(`${type}List element not found`);
      return;
    }
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
      sortedList.sort((a, b) => new Date(a.time) - new Date(b.time));
    } else if (filter === "category") {
      sortedList.sort((a, b) => a.category.localeCompare(b.category));
    }

    updateList(type, sortedList);

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

  const updateTopIncomeCategory = () => {
    const categoryTotals = incomes.reduce((acc, cur) => {
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

    setTopIncomeCategory(topCategory);
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
                labels: {
                  font: {
                    size: 18 // 글씨 크기를 14px로 설정
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return context.label + ": " + context.raw.toLocaleString() + "원";
                  },
                  titleFont: {
                    size: 18 // 툴팁 제목 글씨 크기를 14px로 설정
                  },
                  bodyFont: {
                    size: 18 // 툴팁 본문 글씨 크기를 14px로 설정
                  }
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
                labels: {
                  font: {
                    size: 18 // 글씨 크기를 14px로 설정
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return context.label + ": " + context.raw.toLocaleString() + "원";
                  },
                  titleFont: {
                    size: 14 // 툴팁 제목 글씨 크기를 14px로 설정
                  },
                  bodyFont: {
                    size: 14 // 툴팁 본문 글씨 크기를 14px로 설정
                  }
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
  

  useEffect(() => {
    if (showExpenses) {
      updateList('expense', expenses);
    }
  }, [showExpenses, expenses]);

  useEffect(() => {
    if (showIncomes) {
      updateList('income', incomes);
    }
  }, [showIncomes, incomes]);
  
  const toggleExpensesVisibility = () => {
    setShowExpenses(prevShowExpenses => !prevShowExpenses);
  };

  const toggleIncomesVisibility = () => {
    setShowIncomes(prevShowIncomes => !prevShowIncomes);
  };

  // 데이터가 로드되지 않았다면 로딩 인디케이터 표시
  if (!dataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-custom-green-light flex flex-col items-center p-4 md:p-8">
    <div className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">To-Don List</div>
    <div>
        <button
            onClick={() => setCurrentView("expense")}
            style={{
            backgroundColor: currentView === "expense" ? "#87CEEB" : "white",
            color: currentView === "expense" ? "white" : "#87CEEB",
            border: "none",
            borderRadius: "20px",
            padding: "10px 20px",
            margin: "5px",
            cursor: "pointer",
            outline: "none",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
            }}
        >
            지출
        </button>
        <button
            onClick={() => setCurrentView("income")}
            style={{
            backgroundColor: currentView === "income" ? "#87CEEB" : "white",
            color: currentView === "income" ? "white" : "#87CEEB",
            border: "none",
            borderRadius: "20px",
            padding: "10px 20px",
            margin: "5px",
            cursor: "pointer",
            outline: "none",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
            }}
        >
            수입
        </button>
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
              className="bg-custom-green text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base"
              onClick={() => {
                setIsModalOpen(true);
                setTransactionType("expense");
              }}
            >
              지출 추가
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">총 지출</h2>
            <div id="totalExpense" className="text-xl md:text-2xl font-bold">0원</div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
        <button
            onClick={toggleExpensesVisibility}
            className="bg-custom-green text-white px-4 py-2 rounded-md"
          >
            {showExpenses ? "내역 숨기기" : "내역 보기"}
          </button>
        </div>
          {showExpenses && (
          <div>
          <div className="text-center mb-4">
          <h3 className="text-md md:text-lg font-semibold">가장 많은 지출: {topExpenseCategory}</h3>
          </div>
          <table className="w-full mt-2 border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">시간</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">금액</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">카테고리</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">삭제</th>
              </tr>
            </thead>
          <tbody id="expenseList" className="bg-white"></tbody>
        </table>
        </div>
        )}
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
              className="bg-custom-green text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-sm md:text-base"
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
        <div className="flex justify-between items-center mb-4">
        <button
            onClick={toggleIncomesVisibility}
            className="bg-custom-green text-white px-4 py-2 rounded-md"
          >
           {showIncomes ? "내역 숨기기" : "내역 보기"}
          </button>
        </div>
          { showIncomes && (
          <div>
            <div className="text-center mb-4">
          <h3 className="text-md md:text-lg font-semibold">가장 많은 수입: {topIncomeCategory}</h3>
          </div>
          <table className="w-full mt-2 border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">시간</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">금액</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">카테고리</th>
                <th className="border border-gray-300 p-2 md:p-3 text-xs md:text-sm">삭제</th>
              </tr>
            </thead>
              <tbody id="incomeList" className="bg-white">
              </tbody>
            </table>
          </div>
        )}
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
          <select id={`category${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`} 
            className="border border-gray-400 rounded-md p-2 w-full custom-select"
            style={{ width: '100%' }} >
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
        <label className="block mb-2">
          날짜:
          <input type="date" id={`time${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`} className="border border-gray-400 rounded-md p-2 w-full" />
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
    {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-11/12 sm:w-3/4 lg:w-1/2">
            <div id="transactionDetailsContent" />
            <div className="flex justify-end mt-4">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => setIsDetailsModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
   );
 }