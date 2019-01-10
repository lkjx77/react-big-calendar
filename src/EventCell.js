import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'
import dates from './utils/dates'
import moment from 'moment'
import _ from 'lodash'

let propTypes = {
  event: PropTypes.object.isRequired,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.instanceOf(Date),

  selected: PropTypes.bool,
  isAllDay: PropTypes.bool,
  continuesPrior: PropTypes.bool,
  continuesAfter: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object,

  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
}

class EventCell extends React.Component {
  render() {
    let {
      style,
      className,
      event,
      selected,
      isAllDay,
      onSelect,
      onDoubleClick,
      localizer,
      continuesPrior,
      continuesAfter,
      accessors,
      getters,
      children,
      renderContent,
      employees,
      components: { event: Event, eventWrapper: EventWrapper },
      ...props
    } = this.props


    let title = accessors.title(event)
    // let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let allDay = accessors.allDay(event)

    let employeeId = event.EmployeeID

    // format title HH:MM - HH:MM : title
    const startTime = moment(start).format('hh:mm A')
    const endTime = moment(end).format('hh:mm A')

    let titleFormmat = `${startTime} - ${endTime}: ${title}`
    if (renderContent !== undefined && renderContent === 'roster') {
      const employee = _.find(employees, { EmployeeID: employeeId })
      if (employee !== undefined) {
        // FirstName.LastName: HH:MM AM:PM - HH:MM AM:PM
        titleFormmat = `${employee.FirstName}.${_.first(employee.LastName)}：${startTime} - ${endTime}`
      }

    }
    let showAsAllDay =
      isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1

    let userProps = getters.eventProp(event, start, end, selected)

    const content = (
      <div className="rbc-event-content" title={titleFormmat || undefined}>
        {Event ? (
          <Event
            event={event}
            title={titleFormmat}
            isAllDay={allDay}
            localizer={localizer}
          />
        ) : (
            titleFormmat
          )}
      </div>
    )

    return (
      <EventWrapper {...this.props} type="date">
        <div
          {...props}
          style={{ ...userProps.style, ...style }}
          className={cn('rbc-event', className, userProps.className, {
            'rbc-selected': selected,
            'rbc-event-allday': showAsAllDay,
            'rbc-event-continues-prior': continuesPrior,
            'rbc-event-continues-after': continuesAfter,
          })}
          onClick={e => onSelect && onSelect(event, e)}
          onDoubleClick={e => onDoubleClick && onDoubleClick(event, e)}
        >
          {typeof children === 'function' ? children(content) : content}
        </div>
      </EventWrapper>
    )
  }
}

EventCell.propTypes = propTypes

export default EventCell
