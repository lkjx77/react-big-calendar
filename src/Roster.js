import PropTypes from 'prop-types'
import React from 'react'
import dates from './utils/dates'
import { navigate } from './utils/constants'
import TimeGridRoster from './TimeGridRoster'

class Roster extends React.Component {
  // static propTypes = {
  //   date: PropTypes.instanceOf(Date).isRequired,
  // }

  static defaultProps = TimeGridRoster.defaultProps

  render() {
    let { date, ...props } = this.props
    let range = Roster.range(date, this.props)

    return <TimeGridRoster {...props} range={range} eventOffset={15} />
  }
}

Roster.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week')

    case navigate.NEXT:
      return dates.add(date, 1, 'week')

    default:
      return date
  }
}

Roster.range = (date, { localizer }) => {
  let firstOfWeek = localizer.startOfWeek()
  let start = dates.startOf(date, 'week', firstOfWeek)
  let end = dates.endOf(date, 'week', firstOfWeek)

  return dates.range(start, end)
}

Roster.title = (date, { localizer }) => {
  let [start, ...rest] = Roster.range(date, { localizer })
  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
}

export default Roster
