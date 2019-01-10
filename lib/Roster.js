"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _dates = _interopRequireDefault(require("./utils/dates"));

var _constants = require("./utils/constants");

var _TimeGridRoster = _interopRequireDefault(require("./TimeGridRoster"));

var Roster =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Roster, _React$Component);

  function Roster() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Roster.prototype;

  // static propTypes = {
  //   date: PropTypes.instanceOf(Date).isRequired,
  // }
  _proto.render = function render() {
    var _this$props = this.props,
        date = _this$props.date,
        props = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["date"]);
    var range = Roster.range(date, this.props);
    return _react.default.createElement(_TimeGridRoster.default, (0, _extends2.default)({}, props, {
      range: range,
      eventOffset: 15
    }));
  };

  return Roster;
}(_react.default.Component);

Roster.defaultProps = _TimeGridRoster.default.defaultProps;

Roster.navigate = function (date, action) {
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return _dates.default.add(date, -1, 'week');

    case _constants.navigate.NEXT:
      return _dates.default.add(date, 1, 'week');

    default:
      return date;
  }
};

Roster.range = function (date, _ref) {
  var localizer = _ref.localizer;
  var firstOfWeek = localizer.startOfWeek();

  var start = _dates.default.startOf(date, 'week', firstOfWeek);

  var end = _dates.default.endOf(date, 'week', firstOfWeek);

  return _dates.default.range(start, end);
};

Roster.title = function (date, _ref2) {
  var localizer = _ref2.localizer;

  var _Roster$range = Roster.range(date, {
    localizer: localizer
  }),
      start = _Roster$range[0],
      rest = _Roster$range.slice(1);

  return localizer.format({
    start: start,
    end: rest.pop()
  }, 'dayRangeHeaderFormat');
};

var _default = Roster;
exports.default = _default;
module.exports = exports["default"];