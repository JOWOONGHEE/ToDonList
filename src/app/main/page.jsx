"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';


import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';

import styles from '../styles/main.module.css'; // CSS 모듈 임포트
import '../styles/fullcalender-custom.css';

export default function Main() {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false); // 추가된 상태
  const [isBackgroundDimmed, setIsBackgroundDimmed] = useState(false); // 배경색 변경 상태 추가
  const [orderCounter, setOrderCounter] = useState(0); // 이벤트 순서를 추적할 카운터
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const { data: sessionData, status } = useSession();
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    const handleMediaChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user?.email) {
      const userEmail = sessionData.user.email;
      const savedEvents = localStorage.getItem(`events_${userEmail}`);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents([]); // 저장된 데이터가 없는 경우 빈 배열로 초기화
      }
    }
  }, [sessionData, status]);

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user?.email && sessionData.user.provider) {
      const userKey = `${sessionData.user.provider}_${sessionData.user.email}`;
      const userData = JSON.parse(localStorage.getItem(`userData_${userKey}`));
      console.log("불러온 사용자 데이터:", userData);

      const savedEvents = localStorage.getItem(`events_${userKey}`);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents([]); // 저장된 데이터가 없는 경우 빈 배열로 초기화
      }
    }
  }, [sessionData, status]);

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user?.email) {
      // 데이터가 변경될 때마다 로컬 스토리지에 저장
      localStorage.setItem(`events_${sessionData.user.email}`, JSON.stringify(events));
    }
  }, [events, sessionData, status]);

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user?.email) {
      const userEmail = sessionData.user.email;
      const savedExpenses = localStorage.getItem(`expenses_${userEmail}`);
      const savedIncomes = localStorage.getItem(`incomes_${userEmail}`);
      if (savedExpenses) {
        const expenses = JSON.parse(savedExpenses);
        const total = expenses.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")), 0);
        setTotalExpense(total);
      }
      if (savedIncomes) {
        const incomes = JSON.parse(savedIncomes);
        const total = incomes.reduce((acc, cur) => acc + parseFloat(cur.amount.replace(/\D/g, "")), 0);
        setTotalIncome(total);
      }
    }
  }, [sessionData, status]);
  
  const toggleButtons = () => {
    setShowButtons(!showButtons); // 상태 토글
    setIsBackgroundDimmed(!isBackgroundDimmed); // 배경색 변경 상태 토글
  };

  const handleEventClick = (clickInfo) => {
    const { id, title, extendedProps } = clickInfo.event;

    Swal.fire({
      title: title || extendedProps.schedule,
      html: `<input type="text" id="title" class="swal2-input" value="${title}">
            <input type="text" id="schedule" class="swal2-input" value="${extendedProps.schedule || ''}">`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '수정',
      denyButtonText: '삭제',
      customClass: {
        popup: 'modal'
      }
    }).then(({ isConfirmed, isDenied }) => {
      if (isConfirmed) {
        const newTitle = Swal.getPopup().querySelector('#title').value;
        const newSchedule = Swal.getPopup().querySelector('#schedule').value;

        setEvents(events.map(event =>
          event.id === id ? { ...event, title: newTitle, extendedProps: { ...extendedProps, schedule: newSchedule } } : event
        ));
      } else if (isDenied) {
        setEvents(events.filter(event => event.id !== id));
      }
    });
  };

  const handleDateSelect = async (selectInfo) => {
    const selectedStart = new Date(selectInfo.startStr);
    let selectedEnd = new Date(selectInfo.endStr);

    if (selectInfo.allDay) {
      selectedEnd = new Date(selectedEnd.setDate(selectedEnd.getDate() - 1));
    } else {
      selectedEnd = new Date(selectInfo.endStr);
    }

    if (isMobile) {
      const swalResult = await Swal.fire({
        title: '새 일정 추가',
        html: `<input type="text" id="title" class="swal2-input" placeholder="일정 제목">
              <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
        confirmButtonText: '추가',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#title').value;
          const schedule = Swal.getPopup().querySelector('#schedule').value;
          return { title: title || schedule, schedule };
        },
        customClass: {
          popup: 'modal'
        }
      });

      if (swalResult.isConfirmed) {
        const { title, schedule } = swalResult.value;
        const newEvent = {
          id: String(events.length + 1),
          title,
          start: selectedStart,
          end: new Date(selectedEnd.setDate(selectedEnd.getDate() + 1)),
          allDay: selectInfo.allDay,
          extendedProps: { schedule, orderIndex: orderCounter },
        };
        setOrderCounter(orderCounter + 1);
        setEvents([...events, newEvent]);
      }
      return;
    }

    const foundEvents = events.filter(({ start, end }) => {
      const eventStart = new Date(start);
      const eventEnd = new Date(end);
      if (eventStart.toISOString().split("T")[0] === eventEnd.toISOString().split("T")[0]) {
        return eventStart.toISOString().split("T")[0] === selectedStart.toISOString().split("T")[0];
      }
      return (eventStart <= selectedEnd && eventEnd > selectedStart) || (eventStart >= selectedStart && eventStart < selectedEnd);
    });

    const eventDetails = foundEvents.map((event, index) => {
      let showEndDate = new Date(event.end);
      showEndDate.setDate(showEndDate.getDate() - 1);
      showEndDate = showEndDate.toISOString().split("T")[0];
      return `<div class="clickable-event" data-event-index="${index}">
                일정명: ${event.title || event.extendedProps.schedule}, 시작: ${event.start.toISOString().split("T")[0]}, 종료: ${showEndDate}
              </div>`;
    }).join("<br>");

    const handleSwalClick = (foundEvents) => {
      Swal.getPopup().addEventListener('click', (e) => {
        if (e.target.classList.contains('clickable-event')) {
          const index = e.target.getAttribute('data-event-index');
          const event = foundEvents[index];
          const { id, title, extendedProps } = event;

          Swal.fire({
            title: title || extendedProps.schedule,
            html: `<input type="text" id="title" class="swal2-input" value="${title}">
                  <input type="text" id="schedule" class="swal2-input" value="${extendedProps.schedule}">`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '수정',
            denyButtonText: '삭제',
            customClass: {
              popup: 'modal'
            }
          }).then(({ isConfirmed, isDenied }) => {
            if (isConfirmed) {
              const newTitle = Swal.getPopup().querySelector('#title').value;
              const newSchedule = Swal.getPopup().querySelector('#schedule').value;
              setEvents(events.map(e =>
                e.id === id ? { ...e, title: newTitle, extendedProps: { ...extendedProps, schedule: newSchedule } } : e
              ));
            } else if (isDenied) {
              setEvents(events.filter(e => e.id !== id));
            }
          });
        }
      });
    };

    const handleSwalPreConfirm = () => {
      const title = Swal.getPopup().querySelector('#title').value;
      const schedule = Swal.getPopup().querySelector('#schedule').value;
      return { title: title || schedule, schedule };
    };

    const swalResult = await Swal.fire({
      title: foundEvents.length > 0 ? '찾은 일정' : '일정이 없습니다',
      html: `${foundEvents.length > 0 ? eventDetails : ''}
            <input type="text" id="title" class="swal2-input" placeholder="일정 제목">
            <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
      confirmButtonText: '추가',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: handleSwalPreConfirm,
      didOpen: () => handleSwalClick(foundEvents),
      customClass: {
        popup: 'modal'
      }
    });

    if (swalResult.isConfirmed) {
      const { title, schedule } = swalResult.value;
      const newEvent = {
        id: String(events.length + 1),
        title,
        start: selectedStart,
        end: selectInfo.allDay ? new Date(selectedEnd.setDate(selectedEnd.getDate() + 1)) : new Date(selectInfo.endStr),
        allDay: selectInfo.allDay,
        extendedProps: { schedule, orderIndex: orderCounter },
      };
      setOrderCounter(orderCounter + 1);
      setEvents([...events, newEvent]);
    }
  };

  const handleAddButtonClick = async () => {
    const { value: formValues } = await Swal.fire({
      title: '날짜 선택',
      html:
        '<input id="startDate" class="swal2-input" type="date">' +
        '<input id="endDate" class="swal2-input" type="date">',
      focusConfirm: false,
      confirmButtonText: '추가',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => [
        document.getElementById('startDate').value,
        document.getElementById('endDate').value
      ],
      customClass: {
        popup: 'modal'
      }
    });

    if (formValues) {
      let [startDate, endDate] = formValues;
      if (!startDate && !endDate) startDate = endDate = new Date().toISOString().split("T")[0];
      if (!startDate) startDate = endDate;
      if (!endDate) endDate = startDate;

      const nextDay = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000);
      endDate = nextDay.toISOString().split("T")[0];

      if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

      const { value: newEventDetails } = await Swal.fire({
        title: '일정 정보 입력',
        html: `<input type="text" id="title" class="swal2-input" placeholder="일정 제목">
              <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
        confirmButtonText: '추가',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#title').value;
          const schedule = Swal.getPopup().querySelector('#schedule').value;
          return { title: title || schedule, schedule };
        },
        customClass: {
          popup: 'modal'
        }
      });

      if (newEventDetails) {
        const { title, schedule } = newEventDetails;
        const newEvent = {
          id: String(events.length + 1),
          title,
          start: new Date(startDate),
          end: new Date(new Date(endDate).setDate(new Date(endDate).getDate())),
          allDay: true,
          extendedProps: { schedule, orderIndex: orderCounter },
        };
        setOrderCounter(orderCounter + 1);
        setEvents([...events, newEvent]);
        setShowButtons(false); // 일정 추가 후 버튼 그룹을 닫습니다.
        setIsBackgroundDimmed(false); // 배경 흐려짐 효과도 제거합니다.
      }
    }
  };

  const handleDateClick = (dateClickInfo) => {
    const clickedDate = new Date(dateClickInfo.date);
    // 선택한 날짜의 시작과 끝을 설정합니다.
    const selectedDateStart = new Date(clickedDate.setHours(0, 0, 0, 0));
    const selectedDateEnd = new Date(clickedDate.setHours(23, 59, 59, 999));
    
    const selectedDateEvents = events.filter(event => {
      const eventStartDate = new Date(event.start);
      const eventEndDate = new Date(event.end);
      
      eventEndDate.setDate(eventEndDate.getDate() - 1);

      // 이벤트가 선택한 날짜에 걸쳐 있는지 확인합니다.
      return (
        (eventStartDate <= selectedDateEnd && eventEndDate >= selectedDateStart)
      );
    });
  
    setSelectedDateEvents(selectedDateEvents);
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const handleEventItemClick = (eventIndex) => {
    const event = selectedDateEvents[eventIndex];
    const { id, title, extendedProps } = event;

    Swal.fire({
      title: title || extendedProps.schedule,
      html: `<input type="text" id="title" class="swal2-input" value="${title}">
            <input type="text" id="schedule" class="swal2-input" value="${extendedProps.schedule}">`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '수정',
      denyButtonText: '삭제',
      customClass: {
        popup: 'modal'
      }
    }).then(({ isConfirmed, isDenied }) => {
      if (isConfirmed) {
        const newTitle = Swal.getPopup().querySelector('#title').value;
        const newSchedule = Swal.getPopup().querySelector('#schedule').value;
        setEvents(events.map(e =>
          e.id === id ? { ...e, title: newTitle, extendedProps: { ...extendedProps, schedule: newSchedule } } : e
        ));
      } else if (isDenied) {
        setEvents(events.filter(e => e.id !== id));
      }
    });
  };

  const handleEventDrop = (eventDropInfo) => {
    const { event } = eventDropInfo;
    const { id } = event;
    const newStart = event.start ? new Date(event.startStr) : new Date(newStart.getTime() + 24 * 60 * 60 * 1000);
    const newEnd = event.end ? new Date(event.endStr) : new Date(newStart.getTime() + 24 * 60 * 60 * 1000); // 종일 이벤트의 경우 종료일이 없는 경우 처리
  
    setEvents(events => events.map(e =>
      e.id === id ? { ...e, start: newStart, end: newEnd } : e
    ));
  };

  useEffect(() => {
    console.log("Events updated:", events);
  }, [events]);

  return (
    
    <div className={styles.container}>
      <div className={`${isBackgroundDimmed ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'red' }}>총 지출: -{totalExpense.toLocaleString()}원</h2>
          <h2 className="text-lg font-semibold" style={{ color: 'blue' }}>총 수입: +{totalIncome.toLocaleString()}원</h2>
        </div>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'dayGridMonth timeGridWeek',
                center: 'prev title next',
                right: 'today'
              }}
              buttonText={{
                today: '오늘',
                month: '월',
                week: '주'
              }}
              locale="ko"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              scrollTime="06:00:00"
              dayHeaderFormat={{ weekday: 'short' }}
              dayCellContent={(e) => e.dayNumberText.replace('일', '')}
              eventContent={(eventInfo) => (
                { html: `<div>${eventInfo.event.title || eventInfo.event.extendedProps.schedule}</div>` }
              )}
              views={{
                timeGridWeek: {
                  dayHeaderFormat: { weekday: 'short', day: 'numeric' }
                }
              }}
              dayCellClassNames={(arg) => {
                if (arg.date.getDay() === 0) {
                  return 'fc-day-sun';
                } else if (arg.date.getDay() === 6) {
                  return 'fc-day-sat';
                }
                return '';
              }}
            />
          </div>
          <div className={styles.buttonContainer}>
            <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={toggleButtons}>+</button>
            <div className={`${styles.buttonGroup} ${showButtons ? styles.show : ''}`}>
              <div className="buttonWrapper">
                <span className={styles.buttonText}>AI 챗</span>
                <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => router.push('/aichat')}>
                  <img src="/assets/aiLogo.png" alt="AI" className={styles.buttonIcon} />
                </button>
              </div>
              <div className="buttonWrapper">
                <span className={styles.buttonText}>가계부</span>
                <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => router.push('/accountbook')}>
                  <img src="/assets/accountbookLogo.png" alt="Account Book" className={styles.buttonIcon} />
                </button>
              </div>
              <div className="buttonWrapper">
                <span className={styles.buttonText}>일정</span>
                <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={handleAddButtonClick}>
                  <img src="/assets/calenderLogo.png" alt="Schedule" className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          </div>
      <div className={styles.eventDetails} style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <h2 className={styles.eventTitle}>선택한 날짜의 일정</h2>
        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map((event, index) => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const isSingleDayEvent = startDate.toDateString() === endDate.toDateString();

            return (
              <div key={index} className={styles.eventItem} onClick={() => handleEventItemClick(index)}>
                <h3>일정제목: {event.title || event.extendedProps.schedule} / 일정: {event.extendedProps.schedule}</h3>
                {isSingleDayEvent ? (
                  <p>{formatDate(startDate)}</p>
                ) : (
                  <p>{formatDate(startDate)} ~ {formatDate(new Date(endDate.setDate(endDate.getDate() - 1)))}</p>
                )}
              </div>
            );
          })
        ) : (
          <p>선택한 날짜에 일정이 없습니다.</p>
        )}
      </div>
    </div>
  );
};