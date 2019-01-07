let defaultMessages = {
  date: 'Date',
  time: 'Time',
  event: 'Event',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: '<<',
  next: '>>',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',
  roster: 'Roster',

  noEventsInRange: 'There are no events in this range.',

  showMore: total => `+${total} more`,
}

export default function messages(msgs) {
  return {
    ...defaultMessages,
    ...msgs,
  }
}
