"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';
import styles from '../styles/main.module.css'; // CSS 모듈 임포트

const Main = () => {
  const [events, setEvents] = useState([]);
  const [orderCounter, setOrderCounter] = useState(0); // 이벤트 순서를 추적할 카운터

  //달력에 직접 추가한 일정 수정 및 삭제
  const handleEventClick = (clickInfo) => {
    if (!clickInfo || !clickInfo.event) {
      console.error('Event data is missing or not a proper event object.');
      return;
    }
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
        const newTitle = Swal.getPopup().querySelector('#title').value;
        const newSchedule = Swal.getPopup().querySelector('#schedule').value;

        setEvents(events.map(event => 
          event.id === clickInfo.event.id
            ? { ...event, title: newTitle, extendedProps: { schedule: newSchedule, orderIndex: event.extendedProps.orderIndex } }
            : event
        ));
      } else if (result.isDenied) {
        setEvents(events.filter(event => event.id !== clickInfo.event.id));
      }
    });
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

  const handleAddButtonClick = async () => {
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

  return (
    <div className={styles.container}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventOrder="extendedProps.orderIndex" // 순서대로 정렬
        select={handleDateSelect}
        eventClick={handleEventClick}
      />
      <button className={styles.addButton} onClick={handleAddButtonClick}>
        +
      </button>
    </div>
  );
}

export default Main;