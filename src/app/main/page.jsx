"use client"
import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';

import styles from '../styles/main.module.css'; // CSS 모듈 임포트
import '../styles/fullcalender-custom.css';

const Main = () => {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false); // 추가된 상태
  const [isBackgroundDimmed, setIsBackgroundDimmed] = useState(false); // 배경색 변경 상태 추가

  const calendarRef = useRef(null);

  const handlePrevClick = () => {
    if (calendarRef.current) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
    }
  };

  const handleNextClick = () => {
    if (calendarRef.current) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.next();
    }
  };

  const toggleButtons = () => {
    setShowButtons(!showButtons); // 상태 토글
    setIsBackgroundDimmed(!isBackgroundDimmed); // 배경색 변경 상태 토글
  };

  const handleFirstPlusClick = () => {
    Swal.fire({
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
    }).then((formValues) => {
      if (formValues.value) {
        const [startDate, endDate] = formValues.value;
        console.log('Selected Dates:', startDate, endDate);
        // 여기에 추가 로직을 구현할 수 있습니다.
      }
    });
  };
  const handleEventClick = (clickInfo) => {
    console.log('clickInfo:', clickInfo);
    if (!clickInfo || !clickInfo.event) {
      console.error('Event data is missing or not a proper event object.');
      return;
    }
    console.log('Event clicked:', clickInfo.event.title)
    Swal.fire({
      title: clickInfo.event.title || clickInfo.event.extendedProps.schedule,
      html: `<input type="text" id="title" class="swal2-input" value="${clickInfo.event.title}">
             <input type="text" id="schedule" class="swal2-input" value="${clickInfo.event.extendedProps.schedule || ''}">`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '수정',
      denyButtonText: '삭제',
    }).then((result) => {
      if (result.isConfirmed) {
        clickInfo.event.setProp('title', Swal.getPopup().querySelector('#title').value);
        clickInfo.event.setExtendedProp('schedule', Swal.getPopup().querySelector('#schedule').value);
      } else if (result.isDenied) {
        clickInfo.event.remove();
      }
    });
  };

  const handleDateSelect = (selectInfo) => {
    console.log('Date selected:', selectInfo);
    Swal.fire({
      title: '새 일정 추가',
      html: `<input type="text" id="title" class="swal2-input" placeholder="일정 제목">
             <input type="text" id="schedule" class="swal2-input" placeholder="일정">`,
      confirmButtonText: '추가',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const title = Swal.getPopup().querySelector('#title').value;
        const schedule = Swal.getPopup().querySelector('#schedule').value;
        return { title: title, schedule: schedule };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        let calendarApi = selectInfo.view.calendar;
        calendarApi.unselect(); // clear date selection
        calendarApi.addEvent({
          title: result.value.title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
          extendedProps: {
            schedule: result.value.schedule
          }
        });
      }
    });
  };

  // if (window.navigator.userAgent.includes('Emulation')) {
  //   // 에뮬레이션 모드일 때 실행할 코드
  //   document.addEventListener('click', handleEventClick);
  // } else {
  //   // 일반 모드일 때 실행할 코드
  //   document.addEventListener('click', handleEventClick);
  // }

  return (
    <div className={`flex flex-col items-center justify-center p-5 min-h-screen ${isBackgroundDimmed ? 'bg-gray-200' : 'bg-gray-100'}`}>
      <button
        className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        로그아웃
      </button>
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-5">
        <div className={`${isBackgroundDimmed ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'dayGridMonth timeGridWeek',
              center: 'prev title next',
              right: 'today'
            }}
            customButtons={{
              customPrev: {
                text: '<',
                click: handlePrevClick
              },
              customNext: {
                text: '>',
                click: handleNextClick
              }
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
        />
        
          
        </div>
      </div>
      <div className={styles.buttonContainer}>
          <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={toggleButtons}>+</button>
            <div className={`${styles.buttonGroup} ${showButtons ? styles.show : ''}`}>
              <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => router.push('/aichat')}>AI</button>
              <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => router.push('/accountbook')}>가</button>
              <button className={`${styles.addButton} ${isBackgroundDimmed ? styles.brightButton : ''}`} onClick={() => handleFirstPlusClick()}>일</button>
            </div>
          </div>
    </div>
  );
};


export default Main;


