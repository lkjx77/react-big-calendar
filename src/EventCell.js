import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'
import dates from './utils/dates'
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
      components: { event: Event, eventWrapper: EventWrapper },
      ...props
    } = this.props

    let title = accessors.title(event)
    // let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let allDay = accessors.allDay(event)

    let showAsAllDay =
      isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1

    let userProps = getters.eventProp(event, start, end, selected)

    // format title HH:MM - HH:MM : title
    // const startTime = moment(start).format('hh:mm A')
    // const endTime = moment(end).format('hh:mm A')

    // let titleFormmat = ''

    // if (showAsAllDay) {
    //   const employee = _.find(employees, { EmployeeAutoID: employeeId })

    //   if (employee != undefined) {
    //     titleFormmat = `test:${employee.EmployeeFirstName}.${_.first(
    //       employee.EmployeeLastName
    //     )}`
    //   }
    // } else {
    //   titleFormmat = `${startTime} - ${endTime}: ${title}`
    // }

    // if (renderContent !== undefined && renderContent === 'roster') {
    //   const employee = _.find(employees, { EmployeeID: employeeId })
    //   if (employee !== undefined) {
    //     // FirstName.LastName: HH:MM AM:PM - HH:MM AM:PM
    //     titleFormmat = `${employee.EmployeeFirstName}.${_.first(
    //       employee.EmployeeLastName
    //     )}：${startTime} - ${endTime}`
    //   }
    // }

    const content = (
      <div className="rbc-event-content" title={title || undefined}>
        {Event ? (
          <Event
            event={event}
            title={title}
            isAllDay={allDay}
            localizer={localizer}
          />
        ) : (
          title
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
