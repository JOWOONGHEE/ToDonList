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
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarRef = useRef(null);
  const { data: sessionData } = useSession();

useEffect(() => {
  const userEmail = sessionData?.user?.email;
  if (userEmail) {
    const savedEvents = localStorage.getItem(`events_${userEmail}`);
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }
}, [sessionData]);

useEffect(() => {
  if (sessionData && sessionData.user && sessionData.user.email && sessionData.user.provider) {
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
}, [sessionData]);

  useEffect(() => {
      if (sessionData && sessionData.user && sessionData.user.email) {
          // 데이터가 변경될 때마다 로컬 스토리지에 저장
          localStorage.setItem(`events_${sessionData.user.email}`, JSON.stringify(events));
      }
  }, [events, sessionData]);

  //달력에 직접 추가한 일정 수정 및 삭제
  const handleEventClick = (info) => {  
    if (!info || !info.event) {
      console.error('Event data is missing or not a proper event object.');
      return;
    }
    Swal.fire({
      title: info.event.title || info.event.extendedProps.schedule,
      html: `<input type="text" id="title" class="swal2-input" value="${info.event.title}">
             <input type="text" id="schedule" class="swal2-input" value="${info.event.extendedProps.schedule || ''}">`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '수정',
      denyButtonText: '삭제',
    }).then((result) => {
      if (result.isConfirmed) {
        const newTitle = Swal.getPopup().querySelector('#title').value;
        const newSchedule = Swal.getPopup().querySelector('#schedule').value;

        setEvents(events.map(event => 
          event.id === info.event.id
            ? { ...event, title: newTitle, extendedProps: { schedule: newSchedule, orderIndex: event.extendedProps.orderIndex } }
            : event
        ));
      } else if (result.isDenied) {
        setEvents(events.filter(event => event.id !== info.event.id));
      }
    });
  };

  const toggleButtons = () => {
    setShowButtons(!showButtons); // 상태 토글
    setIsBackgroundDimmed(!isBackgroundDimmed); // 배경색 변경 상태 토글
  };

  const plusSchedule = async () => {
    const { value: formValues } = await Swal.fire({
      title: '출발 날짜와 도착 날짜 선택',
      html: '<input id="startDate" class="swal2-input" type="date">' +
        '<input id="endDate" class="swal2-input" type="date">',
      focusConfirm: false,
      confirmButtonText: '추가',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        return [
          document.getElementById('startDate').value,
          document.getElementById('endDate').value
        ];
      }
    });

    if (formValues) {
      let [startDate, endDate] = formValues;

      if (!startDate && !endDate) {
        startDate = endDate = new Date().toISOString().split("T")[0];
      }

      if (!startDate) {
        startDate = endDate;
      }

      if (!endDate) {
        endDate = startDate;
      }

      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = nextDay.toISOString().split("T")[0];

      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      const result = await Swal.fire({
        title: '일정 정보 입력',
        html: `<input type="text" id="title" class="swal2-input" placeholder="일정 제목">
               <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
        confirmButtonText: '추가',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#title').value;
          const schedule = Swal.getPopup().querySelector('#schedule').value;
          if (!title) {
            return { title: schedule, schedule: schedule };
          }
          return { title: title, schedule: schedule };
        }
      });

      if (result.isConfirmed) {
        const newEvent = {
          id: String(events.length + 1),
          title: result.value.title,
          start: new Date(startDate),
          end: new Date(endDate),
          allDay: true,
          extendedProps: {
            schedule: result.value.schedule,
            orderIndex: orderCounter
          }
        };
        setOrderCounter(orderCounter + 1); // 이벤트 순서 업데이트
        setEvents([...events, newEvent]);
      }
    }
  };

  

  const handleDateSelect = async (selectInfo) => {
    const selectedStart = new Date(selectInfo.startStr);
    const selectedEnd = new Date(selectInfo.end);

    const foundEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // 하루짜리 이벤트를 정확히 동일한 날짜 비교
      if (eventStart.toISOString().split("T")[0] === eventEnd.toISOString().split("T")[0]) {
        return eventStart.toISOString().split("T")[0] === selectedStart.toISOString().split("T")[0];
      }

      return (
        (eventStart <= selectedEnd && eventEnd > selectedStart) ||
        (eventStart >= selectedStart && eventStart < selectedEnd)
      );
    });

    setSelectedDateEvents(foundEvents);
    setSelectedDate(selectInfo.startStr);

    if (foundEvents.length > 0) {
      const eventDetails = foundEvents.map((event, index) => {
        let showEndDate = new Date(event.end);
        showEndDate.setDate(showEndDate.getDate() - 1);
        showEndDate = showEndDate.toISOString().split("T")[0];

        return `<div class="clickable-event" data-event-index="${index}">
                  일정명: ${event.title || event.extendedProps.schedule}, 시작: ${event.start.toISOString().split("T")[0]}, 종료: ${showEndDate}
                </div>`;
      }).join("<br>");

      const result = await Swal.fire({
        title: '찾은 일정',
        html: `${eventDetails}
               <input type="text" id="title" class="swal2-input" placeholder="일정 제목">
               <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
        confirmButtonText: '추가',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#title').value;
          const schedule = Swal.getPopup().querySelector('#schedule').value;
          if (!title) {
            return { title: schedule, schedule: schedule };
          }
          return { title: title, schedule: schedule };
        },
        didOpen: () => {
          Swal.getPopup().addEventListener('click', (e) => {
            if (e.target.classList.contains('clickable-event')) {
              const index = e.target.getAttribute('data-event-index');
              const event = foundEvents[index];
              Swal.fire({
                title: event.title || event.extendedProps.schedule,
                html: `<input type="text" id="title" class="swal2-input" value="${event.title}">
                       <input type="text" id="schedule" class="swal2-input" value="${event.extendedProps.schedule}">`,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: '수정',
                denyButtonText: '삭제',
              }).then((result) => {
                if (result.isConfirmed) {
                  const newTitle = Swal.getPopup().querySelector('#title').value;
                  const newSchedule = Swal.getPopup().querySelector('#schedule').value;
                  setEvents(events.map(e => 
                    e.id === event.id
                      ? { ...e, title: newTitle, extendedProps: { schedule: newSchedule, orderIndex: e.extendedProps.orderIndex } }
                      : e
                  ));
                } else if (result.isDenied) {
                  setEvents(events.filter(e => e.id !== event.id));
                }
              });
            }
          });
        }
      });

      if (result.isConfirmed) {
        let calendarApi = selectInfo.view.calendar;
        calendarApi.unselect(); // clear date selection
        const newEvent = {
          id: String(events.length + 1),
          title: result.value.title,
          start: new Date(selectInfo.startStr),
          end: new Date(selectInfo.endStr),
          allDay: selectInfo.allDay,
          extendedProps: {
            schedule: result.value.schedule,
            orderIndex: orderCounter
          }
        };
        setOrderCounter(orderCounter + 1); // 이벤트 순서 업데이트
        setEvents([...events, newEvent]);
      }
    } else {
      const result = await Swal.fire({
        title: '일정이 없습니다',
        html: `<input type="text" id="title" class="swal2-input" placeholder="일정 제목">
               <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
        confirmButtonText: '추가',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#title').value;
          const schedule = Swal.getPopup().querySelector('#schedule').value;
          if (!title) {
            return { title: schedule, schedule: schedule };
          }
          return { title: title, schedule: schedule };
        }
      });

      if (result.isConfirmed) {
        let calendarApi = selectInfo.view.calendar;
        calendarApi.unselect(); // clear date selection
        const newEvent = {
          id: String(events.length + 1),
          title: result.value.title,
          start: new Date(selectInfo.startStr),
          end: new Date(selectInfo.endStr),
          allDay: selectInfo.allDay,
          extendedProps: {
            schedule: result.value.schedule,
            orderIndex: orderCounter
          }
        };
        setOrderCounter(orderCounter + 1); // 이벤트 순서 업데이트
        setEvents([...events, newEvent]);
      }
    }
  };

  // if (window.navigator.userAgent.includes('Emulation')) {
  //   // 에뮬레이션 모드일 때 실행할 코드
  //   document.addEventListener('click', handleEventClick);
  // } else {
  //   // 일반 모드일 때 실행할 코드
  //   document.addEventListener('click', handleEventClick);
  // }

  return (
    <div className="relative w-screen h-screen bg-white p-5 overflow-auto flex justify-center items-center">
      <div className="max-w-6xl w-full h-full bg-white rounded-lg flex-col">
        <div className={styles.calendarContainer}>
          <div className={`${isBackgroundDimmed ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
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
              locale="ko" // 한글로 변경
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              dayHeaderFormat={{ weekday: 'short' }} // 요일 형식 지정
              dayCellContent={(e) => e.dayNumberText.replace('일', '')} // 날짜 형식에서 "일" 제거
              eventContent={(eventInfo) => (
              { html: `<div>${eventInfo.event.title || eventInfo.event.extendedProps.schedule}</div>` }
              )}
              views={{
                timeGridWeek: {
                  dayHeaderFormat: { weekday: 'short', day: 'numeric' } // 주간 뷰에서 요일과 날짜 형식 지정
                }
              }}
              dayCellClassNames={(arg) => {
                if (arg.date.getDay() === 0) {
                  return 'fc-day-sun'; // 일요일
                } else if (arg.date.getDay() === 6) {
                  return 'fc-day-sat'; // 토요일
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
            <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => plusSchedule()}>
              <img src="/assets/calenderLogo.png" alt="Schedule" className={styles.buttonIcon} />
            </button>
          </div>
        </div>
        
      </div>
        </div>
      </div>
    </div>
    
  );
};



