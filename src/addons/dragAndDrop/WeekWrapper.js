import PropTypes from 'prop-types'
import React from 'react'
import dates from '../../utils/dates'
import { getSlotAtX, pointInBox } from '../../utils/selection'
import { findDOMNode } from 'react-dom'

import { eventSegments } from '../../utils/eventLevels'
import Selection, { getBoundsForNode } from '../../Selection'
// import EventRow from '../../EventRow'
import { dragAccessors } from './common'

const propTypes = {}

const eventTimes = (event, accessors) => {
  let start = accessors.start(event)
  let end = accessors.end(event)

  const isZeroDuration =
    dates.eq(start, end, 'minutes') && start.getMinutes() === 0
  // make zero duration midnight events at least one day long
  if (isZeroDuration) end = dates.add(end, 1, 'day')
  return { start, end }
}

class WeekWrapper extends React.PureComponent {
  static propTypes = {
    isAllDay: PropTypes.bool,
    slotMetrics: PropTypes.object.isRequired,
    accessors: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    resourceId: PropTypes.any,
  }

  static contextTypes = {
    draggable: PropTypes.shape({
      onStart: PropTypes.func,
      onEnd: PropTypes.func,
      dragAndDropAction: PropTypes.object,
      onBeginAction: PropTypes.func,
    }),
  }

  constructor(...args) {
    super(...args)
    this.state = {}
  }

  componentDidMount() {
    this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable()
  }

  reset() {
    if (this.state.segment) this.setState({ segment: null })
  }

  update(event, start, end) {
    const segment = eventSegments(
      { ...event, end, start, __isPreview: true },
      this.props.slotMetrics.range,
      dragAccessors
    )

    // console.log(`event segments: ${JSON.stringify(segment)}`)
    const { segment: lastSegment } = this.state
    if (
      lastSegment &&
      segment.span === lastSegment.span &&
      segment.left === lastSegment.left &&
      segment.right === lastSegment.right
    ) {
      // console.log(`lastSegment: ${JSON.stringify(lastSegment)}`)
      return
    }

    // console.log(`state segment: ${JSON.stringify(segment)}`)
    this.setState({ segment })
  }

  handleMove = ({ x, y }, node) => {
    const { event } = this.context.draggable.dragAndDropAction
    const metrics = this.props.slotMetrics
    const { accessors } = this.props

    if (!event) return

    let rowBox = getBoundsForNode(node)

    if (!pointInBox(rowBox, { x, y })) {
      this.reset()
      return
    }

    // Make sure to maintain the time of the start date while moving it to the new slot
    let start = dates.merge(
      metrics.getDateForSlot(getSlotAtX(rowBox, x, false, metrics.slots)),
      accessors.start(event)
    )

    let end = dates.add(
      start,
      dates.diff(accessors.start(event), accessors.end(event), 'minutes'),
      'minutes'
    )

    this.update(event, start, end)
  }

  handleResize(point, node) {
    const { event, direction } = this.context.draggable.dragAndDropAction
    const { accessors, slotMetrics: metrics } = this.props

    let { start, end } = eventTimes(event, accessors)

    let rowBox = getBoundsForNode(node)
    let cursorInRow = pointInBox(rowBox, point)

    // console.log(`right resize point : ${JSON.stringify(point)}`)
    // console.log(`right resize node: ${JSON.stringify(node)}`)
    // console.log(`right resize rowBox: ${JSON.stringify(rowBox)}`)

    if (direction === 'RIGHT') {
      // console.log(`cursorInRow: ${cursorInRow}`)
      // console.log(`metrics.first: ${JSON.stringify(metrics.first)}`)
      // console.log(`metrics.last: ${JSON.stringify(metrics.last)}`)
      // console.log(`metrics.slots: ${metrics.slots}`)

      if (cursorInRow) {
        if (metrics.last < start) return this.reset()

        // const cursorInRowSlot = getSlotAtX(
        //   rowBox,
        //   point.x,
        //   false,
        //   metrics.slots
        // )

        // add min
        end = dates.add(
          metrics.getDateForSlot(
            getSlotAtX(rowBox, point.x, false, metrics.slots)
          ),
          1,
          'day'
        )
        // console.log(`cursorInRowSlot: ${cursorInRowSlot}, end: ${end}`)
      } else if (
        dates.inRange(start, metrics.first, metrics.last) &&
        (rowBox.right < point.x &&
          rowBox.top < point.y &&
          rowBox.bottom > point.y)
      ) {
        // this.setState({ segment: null })
        // return
        end = dates.add(metrics.last, 1, 'milliseconds')
      } else if (rowBox.bottom < point.y && +metrics.first > +start) {
        end = dates.add(metrics.last, 1, 'milliseconds')
      } else if (
        dates.inRange(start, metrics.first, metrics.last) &&
        (rowBox.right > point.x &&
          rowBox.top < point.y &&
          rowBox.bottom > point.y)
      ) {
        end = dates.add(metrics.last, 1, 'milliseconds')
      } else if (
        dates.inRange(start, metrics.first, metrics.last) &&
        (rowBox.right > point.x && rowBox.top > point.y)
      ) {
        this.setState({ segment: null })
        return
      } else {
        this.setState({ segment: null })
        return
      }

      end = dates.max(end, dates.add(start, 1, 'day'))
    } else if (direction === 'LEFT') {
      // console.log(`LEFT resize`)
      // inbetween Row
      if (cursorInRow) {
        if (metrics.first > end) return this.reset()

        start = metrics.getDateForSlot(
          getSlotAtX(rowBox, point.x, false, metrics.slots)
        )
      } else if (
        dates.inRange(end, metrics.first, metrics.last) &&
        (rowBox.left > point.x &&
          rowBox.top < point.y &&
          rowBox.bottom > point.y)
      ) {
        start = dates.add(metrics.first, -1, 'milliseconds')
      } else if (rowBox.top > point.y && +metrics.last < +end) {
        start = dates.add(metrics.first, -1, 'milliseconds')
      } else if (
        dates.inRange(end, metrics.first, metrics.last) &&
        (rowBox.left < point.x &&
          rowBox.top < point.y &&
          rowBox.bottom > point.y)
      ) {
        start = dates.add(metrics.first, -1, 'milliseconds')
      } else {
        // console.log(`Left null:`)
        this.reset()
        return
      }

      start = dates.min(dates.add(end, -1, 'day'), start)
    }

    // console.log(
    //   `event-> ${JSON.stringify(event)} , start: ${start}, end: ${end}`
    // )
    this.update(event, start, end)
  }

  _selectable = () => {
    let node = findDOMNode(this).closest('.rbc-month-row, .rbc-allday-cell')
    let container = node.closest('.rbc-month-view, .rbc-time-view')

    let selector = (this._selector = new Selection(() => container))

    selector.on('beforeSelect', point => {
      const { isAllDay } = this.props
      const { action } = this.context.draggable.dragAndDropAction

      return (
        action === 'move' ||
        (action === 'resize' &&
          (!isAllDay || pointInBox(getBoundsForNode(node), point)))
      )
    })

    selector.on('selecting', box => {
      const bounds = getBoundsForNode(node)
      const { dragAndDropAction } = this.context.draggable

      if (dragAndDropAction.action === 'move') this.handleMove(box, bounds)
      if (dragAndDropAction.action === 'resize') this.handleResize(box, bounds)
    })

    selector.on('selectStart', () => this.context.draggable.onStart())
    selector.on('select', point => {
      const bounds = getBoundsForNode(node)

      if (!this.state.segment || !pointInBox(bounds, point)) return
      this.handleInteractionEnd()
    })
    selector.on('click', () => this.context.draggable.onEnd(null))
    // onReset end +++
    // selector.on('reset', () => this.context.draggable.onEnd(null))
    selector.on('reset', () => {
      this.reset()
      this.context.draggable.onEnd(null)
    })
  }

  handleInteractionEnd = () => {
    const { resourceId, isAllDay } = this.props
    const { event } = this.state.segment

    this.reset()

    this.context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId,
      isAllDay,
    })
  }

  _teardownSelectable = () => {
    if (!this._selector) return
    this._selector.teardown()
    this._selector = null
  }

  render() {
    // const { children, accessors } = this.props
    const { children } = this.props

    // let { segment } = this.state

    // console.log(`draw segment: ${JSON.stringify(segment)}`)

    return (
      <div className="rbc-addons-dnd-row-body">
        <div className="child" />
        {children}

        <div className="segment begin" />
        {/* {console.log(
          `slotMetrics.first: ${JSON.stringify(this.props.slotMetrics.first)}`
        )}
        {console.log(
          `slotMetrics.last: ${JSON.stringify(this.props.slotMetrics.last)}`
        )}
        {console.log(`addtional segment: ${JSON.stringify(segment)}`)} */}
        {/* {segment && (
          <EventRow
            {...this.props}
            selected={null}
            className="rbc-addons-dnd-drag-row"
            segments={[segment]}
            accessors={{
              ...accessors,
              ...dragAccessors,
            }}
          />
        )} */}

        <div className="segment end" />
      </div>
    )
  }
}

WeekWrapper.propTypes = propTypes

export default WeekWrapper
