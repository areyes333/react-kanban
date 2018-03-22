import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Textarea from "react-textarea-autosize";
import Modal from "react-modal";
import Calendar from "./Calendar";
import CardDetails from "./CardDetails";
import CardOptions from "./CardOptions";
import findCheckboxes from "./findCheckboxes";

class CardEditor extends Component {
  static propTypes = {
    card: PropTypes.shape({
      text: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      color: PropTypes.string
    }).isRequired,
    listId: PropTypes.string.isRequired,
    cardElement: PropTypes.shape({
      getBoundingClientRect: PropTypes.func.isRequired
    }),
    isOpen: PropTypes.bool.isRequired,
    toggleCardEditor: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      newText: props.card.text,
      isCalendarOpen: false,
      isColorPickerOpen: false,
      isTextareaFocused: true
    };
    if (typeof document !== "undefined") {
      Modal.setAppElement("#app");
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ newText: nextProps.card.text });
  };

  handleKeyDown = event => {
    if (event.keyCode === 13 && event.shiftKey === false) {
      event.preventDefault();
      this.submitCard();
    }
  };

  submitCard = () => {
    const { newText } = this.state;
    const { card, listId, dispatch, toggleCardEditor } = this.props;
    if (newText === "") {
      this.deleteCard();
    } else if (newText !== card.text) {
      dispatch({
        type: "CHANGE_CARD_TEXT",
        payload: {
          cardText: newText,
          cardId: card._id,
          listId
        }
      });
    }
    toggleCardEditor();
  };

  handleChange = event => {
    this.setState({ newText: event.target.value });
  };

  toggleCalendar = () => {
    this.setState({ isCalendarOpen: !this.state.isCalendarOpen });
  };

  toggleColorPicker = () => {
    this.setState({ isColorPickerOpen: !this.state.isColorPickerOpen });
  };

  handleRequestClose = () => {
    const { isCalendarOpen, isColorPickerOpen } = this.state;
    const { toggleCardEditor } = this.props;
    if (!isCalendarOpen && !isColorPickerOpen) {
      toggleCardEditor();
    }
  };

  render() {
    const {
      newText,
      isCalendarOpen,
      isColorPickerOpen,
      isTextareaFocused
    } = this.state;
    const { cardElement, card, listId, isOpen } = this.props;
    if (!cardElement) {
      return null;
    }
    const boundingRect = cardElement.getBoundingClientRect();

    const checkboxes = findCheckboxes(newText);

    const isCardNearRightBorder =
      window.innerWidth - boundingRect.right < boundingRect.left;
    const isThinDisplay = window.innerWidth < 550;

    const style = {
      content: {
        top: Math.min(
          boundingRect.top,
          window.innerHeight - boundingRect.height - 18
        ),
        left: isCardNearRightBorder ? null : boundingRect.left,
        right: isCardNearRightBorder
          ? window.innerWidth - boundingRect.right
          : null,
        flexDirection: isCardNearRightBorder ? "row-reverse" : "row"
      }
    };

    const mobileStyle = {
      content: {
        flexDirection: "column",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)"
      }
    };

    const calendarStyle = {
      content: {
        top: Math.min(boundingRect.bottom + 10, window.innerHeight - 300),
        left: boundingRect.left
      }
    };

    const calendarMobileStyle = {
      content: {
        top: 110,
        left: "50%",
        transform: "translateX(-50%)"
      }
    };

    return (
      <Modal
        closeTimeoutMS={150}
        isOpen={isOpen}
        onRequestClose={this.handleRequestClose}
        contentLabel="Card editor"
        overlayClassName="modal-underlay"
        className="modal"
        style={isThinDisplay ? mobileStyle : style}
        includeDefaultStyles={false}
        onClick={this.handleRequestClose}
      >
        <div
          className="modal-textarea-wrapper"
          style={{
            minHeight: isThinDisplay ? "none" : boundingRect.height,
            width: boundingRect.width,
            boxShadow: isTextareaFocused
              ? "0px 0px 3px 2px rgb(0, 180, 255)"
              : null,
            background: card.color
          }}
        >
          <Textarea
            autoFocus
            useCacheForDOMMeasurements
            value={newText}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            className="modal-textarea"
            spellCheck={false}
            onFocus={() => this.setState({ isTextareaFocused: true })}
            onBlur={() => this.setState({ isTextareaFocused: false })}
          />
          {card.date || checkboxes.total > 0 ? (
            <CardDetails date={card.date} checkboxes={checkboxes} />
          ) : null}
        </div>
        <CardOptions
          isColorPickerOpen={isColorPickerOpen}
          card={card}
          listId={listId}
          isCardNearRightBorder={isCardNearRightBorder}
          toggleColorPicker={this.toggleColorPicker}
          toggleCalendar={this.toggleCalendar}
        />
        <Modal
          isOpen={isCalendarOpen}
          onRequestClose={this.toggleCalendar}
          overlayClassName="calendar-underlay"
          className="calendar-modal"
          style={isThinDisplay ? calendarMobileStyle : calendarStyle}
        >
          <Calendar
            cardId={card._id}
            date={card.date}
            toggleCalendar={this.toggleCalendar}
          />
        </Modal>
      </Modal>
    );
  }
}

export default connect()(CardEditor);
