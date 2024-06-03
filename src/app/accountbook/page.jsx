"use client"
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from '../styles/accountbook.module.css';

let myChart;

export default function accountBook() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    updateChart();
  }, [expenses, incomes]);

  const addTransaction = (type) => {
    const amountInput = document.getElementById(`amount${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const categoryInput = document.getElementById(`category${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const memoInput = document.getElementById(`memo${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const time = new Date();
    
    const formattedTime = time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    if (type === 'expense') {
        const newRow = document.createElement('tr');
        const transactionId = time.getTime();
        newRow.setAttribute('data-id', transactionId);
        newRow.innerHTML = `
            <td>${formattedTime}</td>
            <td>${amountInput}원</td>
            <td>${categoryInput}</td>
            <td>${memoInput}</td>
            <td><button class="delete-btn" data-type="${type}" data-id="${transactionId}">삭제</button></td>
        `;
        document.getElementById('expenseList').appendChild(newRow);
        setExpenses(prevExpenses => {
            const newExpenses = [...prevExpenses, {
                time: time,
                amount: amountInput,
                category: categoryInput,
                memo: memoInput,
                id: transactionId
            }];
            updateSummary(newExpenses, incomes); // 요약 정보 업데이트
            return newExpenses;
        });
    } else if (type === 'income') {
        const newRow = document.createElement('tr');
        const transactionId = time.getTime();
        newRow.setAttribute('data-id', transactionId);
        newRow.innerHTML = `
            <td>${formattedTime}</td>
            <td>${amountInput}원</td>
            <td>${categoryInput}</td>
            <td>${memoInput}</td>
            <td><button class="delete-btn" data-type="${type}" data-id="${transactionId}">삭제</button></td>
        `;
        document.getElementById('incomeList').appendChild(newRow);
        setIncomes(prevIncomes => {
            const newIncomes = [...prevIncomes, {
                time: time,
                amount: amountInput,
                category: categoryInput,
                memo: memoInput,
                id: transactionId
            }];
            updateSummary(expenses, newIncomes); // 요약 정보 업데이트
            return newIncomes;
        });
    }

    document.getElementById(`memo${type.charAt(0).toUpperCase() + type.slice(1)}`).value = '';

    updateSummary();
    updateChart();
  };

  useEffect(() => {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDelete);
    });

    // Cleanup function to remove event listeners
    return () => {
        deleteButtons.forEach(button => {
            button.removeEventListener('click', handleDelete);
        });
    };
}, [expenses, incomes]); // Dependencies array includes expenses and incomes to re-apply listeners when these change

  const handleDelete = (event) => {
    const button = event.target;
    const type = button.getAttribute('data-type');
    const transactionId = parseInt(button.getAttribute('data-id'), 10);
    deleteTransaction(button, type, transactionId);
  };

  const deleteTransaction = (button, type, transactionId) => {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);

    if (type === 'expense') {
        setExpenses(prevExpenses => {
            const updatedExpenses = prevExpenses.filter(expense => expense.id !== transactionId);
            updateSummary(updatedExpenses, incomes); // 요약 정보 업데이트
            return updatedExpenses;
        });
    } else if (type === 'income') {
        setIncomes(prevIncomes => {
            const updatedIncomes = prevIncomes.filter(income => income.id !== transactionId);
            updateSummary(expenses, updatedIncomes); // 요약 정보 업데이트
            return updatedIncomes;
        });
    }


    filterTransactions(type);
    updateChart();
  };

  const filterTransactions = (type) => {
    const filter = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const list = type === 'expense' ? expenses : incomes;
    const listElement = document.getElementById(`${type}List`);

    while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
    }

    let sortedList = [...list];

    if (filter === 'money') {
        sortedList.sort((a, b) => parseFloat(a.amount.replace(/\D/g, '')) - parseFloat(b.amount.replace(/\D/g, '')));
    } else if (filter === 'time') {
        sortedList.sort((a, b) => a.time - b.time);
    } else if (filter === 'category') {
        sortedList.sort((a, b) => a.category.localeCompare(b.category));
    }

    function parseAmount(amountString) {
        return parseFloat(amountString.replace(/\D/g, ''));
    }

    
    // Call the updateChart function when the page is loaded
    window.onload = function () {
        updateChart();
    };
    sortedList.forEach(item => {
        const newRow = document.createElement('tr');
        const formattedTime = item.time.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        newRow.innerHTML = `
            <td>${formattedTime}</td>
            <td>${formatAmount(parseAmount(item.amount))}원</td>
            <td>${item.category}</td>
            <td>${item.memo}</td>
            <td><button class="delete-btn" data-type="${type}" data-id="${item.id}">삭제</button></td>
        `;
        listElement.appendChild(newRow);
    });

    updateSummary();
    updateChart();
  };

  const updateSummary = (expenses = [], incomes = []) => {
    const totalExpense = expenses.length > 0 ? expenses.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, '')), 0) : 0;
    const totalIncome = incomes.length > 0 ? incomes.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, '')), 0) : 0;

    document.getElementById('totalExpense').textContent = formatAmount(totalExpense) + "원";
    document.getElementById('totalIncome').textContent = formatAmount(totalIncome) + "원";
  };

    const updateChart = () => {
        // Destroy the previous chart instance if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Get the canvas element
        const ctx = document.getElementById('myChart').getContext('2d');

        // Create a new Chart instance
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['지출', '수입'],
                datasets: [{
                    label: '가계부 그래프',
                    backgroundColor: ['#FF6384', '#36A2EB'],
                    data: [
                        expenses.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, '')), 0),
                        incomes.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, '')), 0)
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };


  const formatAmount = (input) => {
    return Number(input).toLocaleString();
  };

  const onAmountChange = (type) => {
    const amountInput = document.getElementById(`amount${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const formattedAmount = amountInput.value.replace(/\D/g, '');
    amountInput.value = formatAmount(formattedAmount);
  };

  return (  
    <div className="min-h-screen bg-custom-green-light flex flex-col items-center p-8">
        <div className="text-4xl font-bold text-black mb-6">가계부</div>
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex justify-end w-full">
        <div className="flex flex-col border border-custom-green p-2">
            <div className="flex justify-between mb-2">
            <h3 className="mr-2">지출</h3>
            <p id="totalExpense">0원</p>
            </div>
            <div className="flex justify-between">
            <h3 className="mr-2">수입</h3>
            <p id="totalIncome">0원</p>
            </div>
        </div>
        </div>
          <div className="w-full">
            <h2 className="text-lg font-semibold">지출 목록</h2>
            <div className="mb-4 flex items-center space-x-2">
                <label htmlFor="filterExpense">필터링 및 정렬:</label>
                <select id="filterExpense" onChange={() => filterTransactions('expense')}>
                    <option value="time">시간순</option>
                    <option value="money">금액순</option>
                    <option value="category">카테고리별</option>
                </select>
            </div>
    
            <form id="transactionFormExpense">
                <label htmlFor="amountExpense">금액:</label>
                <input type="text" id="amountExpense" name="amountExpense" required onInput={() => onAmountChange('expense')} />
                <label htmlFor="categoryExpense">카테고리:</label>
                <select id="categoryExpense" name="categoryExpense">
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

                </select>
                <label htmlFor="memoExpense">메모:</label>
                <input type="text" id="memoExpense" name="memoExpense" />
                <button type="button" onClick={() => addTransaction('expense')}>지출 추가</button>
            </form>
    
            <table id="expenseTable">
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>금액</th>
                        <th>카테고리</th>
                        <th>메모</th>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody id="expenseList">
                </tbody>
            </table>
          </div>
    
          {/* 수입 목록 */}
    
          <h2>수입 목록</h2>
          <div className={styles.transactionSection}>
            <div>
                <label htmlFor="filterIncome">필터링 및 정렬:</label>
                <select id="filterIncome" onChange={() => filterTransactions('income')}>
                    <option value="time">시간순</option>
                    <option value="money">금액순</option>
                    <option value="category">카테고리별</option>
                </select>
            </div>
    
            <form id="transactionFormIncome">
                <label htmlFor="amountIncome">금액:</label>
                <input type="text" id="amountIncome" name="amountIncome" required onInput={() => onAmountChange('income')} />
                <label htmlFor="categoryIncome">카테고리:</label>
                <select id="categoryIncome" name="categoryIncome">
                    <option value="월급">월급</option>
                    <option value="부수입">부수입</option>
                    
                    {/* 나머지 옵션들 */}
                </select>
                <label htmlFor="memoIncome">메모:</label>
                <input type="text" id="memoIncome" name="memoIncome" />
                <button type="button" onClick={() => addTransaction('income')}>수입 추가</button>
            </form>
        <div>
            <table id="incomeTable">
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>금액</th>
                        <th>카테고리</th>
                        <th>메모</th>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody id="incomeList">
                </tbody>
            </table>
          </div>
        </div>
          <div id="chartContainer" className={styles.chartContainer}>
            <canvas id="myChart"></canvas>
          </div>
        </div>
      </div>
  );
 };