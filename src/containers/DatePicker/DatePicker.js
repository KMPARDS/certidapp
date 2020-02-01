import React, { Component } from 'react';

const MONTH = {
  1: {name: 'Jan', days: 31},
  2: {name: 'Feb', days: 29},
  3: {name: 'Mar', days: 31},
  4: {name: 'Apr', days: 30},
  5: {name: 'May', days: 31},
  6: {name: 'Jun', days: 30},
  7: {name: 'Jul', days: 31},
  8: {name: 'Aug', days: 31},
  9: {name: 'Sep', days: 30},
  10: {name: 'Oct', days: 31},
  11: {name: 'Nov', days: 30},
  12: {name: 'Dec', days: 31}
};
export default class extends Component {
  state = {
    date: null,
    month: null,
    year: null,
    errorMessage: ''
  }

  updateState = async obj => {
    await this.setState({...obj, errorMessage: ''});
    if(this.props.onChange && this.state.date
      && this.state.month && this.state.year
    ) {
      try {
        const d = new Date(`${this.state.date} ${MONTH[this.state.month].name} ${this.state.year}`);
        if(d instanceof Date && isNaN(d)) throw new Error('Invalid Date');
        // const dateStr = this.state.date+'/'+this.state.month+'/'+this.state.year;
        this.props.onChange(d);
      } catch(error) {
        this.setState({ errorMessage: error.message });
      }
    }
  }

  render = () => (
    <>
      <div>
        Select Date:
        <select onChange={event => this.updateState({ date: event.target.value })}>
          <option selected disabled value={null}>Select Date</option>
          {Array.from(Array(this.state.month ? MONTH[this.state.month].days : 31).keys()).map(key => key+1).map(date => (
            <option value={date}>{date}</option>
          ))}
        </select>
      </div>
      <div>
        Select Month:
        <select onChange={event => this.updateState({ month: event.target.value })}>
          <option selected disabled value={null}>Select Month</option>
          {Array.from(Array(12).keys()).map(key => key+1).map(month => (
            <option value={month}>{MONTH[month].name}</option>
          ))}
        </select>
      </div>
      <div>
        Select Year:
        <select onChange={event => this.updateState({ year: event.target.value })}>
          <option selected disabled value={null}>Select Year</option>
          {Array.from(Array(50).keys()).map(key => key+1951).map(year => (
            <option value={year}>{year}</option>
          ))}
        </select>
      </div>
      {this.state.errorMessage ? <p className="error-message">{this.state.errorMessage}</p> : null}
    </>
  );
}
