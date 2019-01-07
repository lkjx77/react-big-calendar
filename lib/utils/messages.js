'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = messages

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var defaultMessages = {
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
  showMore: function showMore(total) {
    return '+' + total + ' more'
  },
}

function messages(msgs) {
  return (0, _extends2.default)({}, defaultMessages, msgs)
}

module.exports = exports['default']
