"use client"
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from '../styles/accountbook.module.css';
import { useSession } from 'next-auth/react'; // next-auth에서 제공하는 훅 사용

let myChart;

export default function accountBook() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [view, setView] = useState('expense'); // 'expense' 또는 'income'을 저장하는 상태
  //const { data: sessionData } = useSession(); // 세션 데이터 불러오기
  const { data: sessionData, status } = useSession();

  useEffect(() => {
    console.log("세션 데이터:", sessionData); // 세션 데이터 전체를 로그로 출력
    if (sessionData && sessionData.user && sessionData.user.email) {
        const userEmail = sessionData.user.email;
        console.log("세션 데이터 있음:", userEmail); // 세션 데이터 확인
        const savedExpenses = localStorage.getItem(`expenses_${userEmail}`);
        const savedIncomes = localStorage.getItem(`incomes_${userEmail}`);
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedIncomes) setIncomes(JSON.parse(savedIncomes));
    } else {
        console.log("세션 데이터 또는 이메일이 없음");
    }
}, [sessionData]);

    useEffect(() => {
        if (sessionData && sessionData.user && sessionData.user.email) {
            const userEmail = sessionData.user.email;
            console.log("저장 시도: ", expenses, incomes); // 저장되는 데이터 확인
            try {
                localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenses));
                localStorage.setItem(`incomes_${userEmail}`, JSON.stringify(incomes));
            } catch (error) {
                console.error("로컬 스토리지 저장 실패:", error);
            }
        }
    }, [expenses, incomes, sessionData]);

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

    const transaction = {
      id: time.getTime(),
      type,
      time: formattedTime,
      amount: amountInput,
      category: categoryInput,
      memo: memoInput
    };

    if (type === 'expense') {
      setExpenses(prevExpenses => {
        const newExpenses = [...prevExpenses, transaction];
        updateSummary(newExpenses, incomes); // 상태 업데이트 후 요약 정보 업데이트
        return newExpenses;
      });
    } else {
      setIncomes(prevIncomes => {
        const newIncomes = [...prevIncomes, transaction];
        updateSummary(expenses, newIncomes); // 상태 업데이트 후 요약 정보 업데이트
        return newIncomes;
      });
    }

    document.getElementById(`amount${type.charAt(0).toUpperCase() + type.slice(1)}`).value = '';
    document.getElementById(`category${type.charAt(0).toUpperCase() + type.slice(1)}`).value = '';
    document.getElementById(`memo${type.charAt(0).toUpperCase() + type.slice(1)}`).value = '';

    updateChart();
};

  const filterTransactions = (type) => {
    const filterElement = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (!filterElement) return; // 요소가 존재하지 않으면 함수 종료
  
    const filter = filterElement.value;
    const list = type === 'expense' ? expenses : incomes;
    const listElement = document.getElementById('transactionTable').querySelector('tbody');
  
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

    sortedList.forEach(item => {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${item.type}</td>
        <td>${item.time}</td>
        <td>${formatAmount(parseFloat(item.amount.replace(/\D/g, '')))}원</td>
        <td>${item.category}</td>
        <td>${item.memo}</td>
        <td><button class="delete-btn" data-type="${item.type}" data-id="${item.id}">삭제</button></td>
      `;
      listElement.appendChild(newRow);
    });
  
    updateSummary();
    updateChart();
  };

  const renderTransactions = () => {
    const list = view === 'expense' ? expenses : incomes;
    return list.map(item => (
      <tr key={item.id}>
        <td>{item.type}</td>
        <td>{item.time}</td>
        <td>{item.amount}원</td>
        <td>{item.category}</td>
        <td>{item.memo}</td>
        <td><button className="delete-btn" data-type={item.type} data-id={item.id} onClick={() => deleteTransaction(item.type, item.id)}>삭제</button></td>
      </tr>
    ));
  };

  const deleteTransaction = (type, id) => {
    if (type === 'expense') {
        const updatedExpenses = expenses.filter(item => item.id !== id);
        setExpenses(updatedExpenses);
        updateSummary(updatedExpenses, incomes); // 요약 정보 업데이트
    } else {
        const updatedIncomes = incomes.filter(item => item.id !== id);
        setIncomes(updatedIncomes);
        updateSummary(expenses, updatedIncomes); // 요약 정보 업데이트
    }
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
    deleteTransaction(type, transactionId);
  };

//   const deleteTransaction = (button, type, transactionId) => {
//     const row = button.closest('tr');
//     row.parentNode.removeChild(row);

//     if (type === 'expense') {
//         setExpenses(prevExpenses => {
//             const updatedExpenses = prevExpenses.filter(expense => expense.id !== transactionId);
//             updateSummary(updatedExpenses, incomes); // 요약 정보 업데이트
//             return updatedExpenses;
//         });
//     } else if (type === 'income') {
//         setIncomes(prevIncomes => {
//             const updatedIncomes = prevIncomes.filter(income => income.id !== transactionId);
//             updateSummary(expenses, updatedIncomes); // 요약 정보 업데이트
//             return updatedIncomes;
//         });
//     }

//     filterTransactions(type);
//     updateChart();
//   };

  

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
        labels: view === 'expense' ? ['지출'] : ['수입'],
        datasets: [{
          label: '가계부 그래프',
          backgroundColor: view === 'expense' ? ['#FF6384'] : ['#36A2EB'],
          data: view === 'expense' ? [
            expenses.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, '')), 0)
          ] : [
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
        <div className="flex justify-center mb-4">
          <button className={`px-4 py-2 ${view === 'expense' ? 'bg-custom-green' : 'bg-gray-200'}`} onClick={() => setView('expense')}>지출</button>
          <button className={`px-4 py-2 ${view === 'income' ? 'bg-custom-green' : 'bg-gray-200'}`} onClick={() => setView('income')}>수입</button>
        </div>
        <div className="w-full">
          <h2 className="text-lg font-semibold">{view === 'expense' ? '지출 목록' : '수입 목록'}</h2>
          <div className="mb-4 flex items-center space-x-2">
          <select id={`filter${view.charAt(0).toUpperCase() + view.slice(1)}`} onChange={() => filterTransactions(view)}>
              <option value="time">시간순</option>
              <option value="money">금액순</option>
              <option value="category">카테고리별</option>
            </select>
          </div>
          <form id={`transactionForm${view.charAt(0).toUpperCase() + view.slice(1)}`}>
            <label htmlFor={`amount${view.charAt(0).toUpperCase() + view.slice(1)}`}>금액:</label>
            <input type="text" id={`amount${view.charAt(0).toUpperCase() + view.slice(1)}`} name={`amount${view.charAt(0).toUpperCase() + view.slice(1)}`} required />
            <label htmlFor={`category${view.charAt(0).toUpperCase() + view.slice(1)}`}>카테고리:</label>
            <select id={`category${view.charAt(0).toUpperCase() + view.slice(1)}`} name={`category${view.charAt(0).toUpperCase() + view.slice(1)}`}>
              {view === 'expense' ? (
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
                  {/* 나머지 옵션들 */}
                </>
              )}
            </select>
            <label htmlFor={`memo${view.charAt(0).toUpperCase() + view.slice(1)}`}>메모:</label>
            <input type="text" id={`memo${view.charAt(0).toUpperCase() + view.slice(1)}`} name={`memo${view.charAt(0).toUpperCase() + view.slice(1)}`} />
            <button type="button" onClick={() => addTransaction(view)}>{view === 'expense' ? '지출 추가' : '수입 추가'}</button>
          </form>
          <table id="transactionTable">
            <thead>
              <tr>
                <th>수입수출</th>
                <th>시간</th>
                <th>금액</th>
                <th>카테고리</th>
                <th>메모</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {renderTransactions()}
            </tbody>
          </table>
        </div>
        <div id="chartContainer" className={styles.chartContainer}>
          <canvas id="myChart"></canvas>
        </div>
      </div>
    </div>
  );
}
               
       
