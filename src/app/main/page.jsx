"use client"
import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';
import styles from '../_styles/main.module.css'; // CSS 모듈 임포트

const Main = () => {
  const [events, setEvents] = useState([]);

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
    <div className={styles.container}>
      <button onClick={() => signOut({ callbackUrl: '/login' })}>
        로그아웃
      </button>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => (
          { html: `<div>${eventInfo.event.title || eventInfo.event.extendedProps.schedule}</div>` }
        )}
      />
      <button className={styles.addButton} onClick={() => {
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
            Swal.fire({
              title: '일정 정보 입력',
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
                const newEvent = {
                  title: result.value.title,
                  start: startDate,
                  end: endDate,
                  allDay: true,
                  extendedProps: {
                    schedule: result.value.schedule
                  }
                };
                setEvents([...events, newEvent]);
              }
            });
          }
        });
      }}>+</button>
    </div>
  );
};


export default Main;

