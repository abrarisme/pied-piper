import React from 'react'
import { Header } from 'semantic-ui-react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getAllTicketsThunk } from "../actions/thunk/tickets";
import { getUserState } from "../reducers";
import TicketTable from './ticketTable'


class SearchableTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {filterStr: ''}
  }
  componentDidMount(){
    console.log('Loading tickets...')
    this.props.loadTickets();
  }
  render() {
    if(this.props.tickets && this.props.tickets){
      return (
        <div>
          <div className="ui input focus fluid">
            <input placeholder="Search..." type="text" onChange={ e => this.setState({ filterStr: e.target.value }) } value={this.state.filterStr} />
          </div>
          <TicketTable tickets={this.props.tickets.filter(t => searchTicket(t, this.state.filterStr))} />
        </div>
      )
    }
    else {
      return <Header as='h2'> No tickets to show.</Header>
    }
  }
}

const searchTicket = (ticket, str) => {
  let s = str.toLowerCase()
  console.log(ticket)
  if(ticket.applicant){
    if(ticket.applicant.firstName.toLowerCase().includes(s)
      || ticket.applicant.lastName.toLowerCase().includes(s)
      || ticket.applicant.faculty.toLowerCase().includes(s)){
      return true;
    }
  }
  return (ticket.ticketId.includes(s)
    || ticket.state.toLowerCase().includes(s))
}

const mapStateToProps = (state) => ({
  tickets: state.tickets,
  userType: getUserState(state).user.type
});

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    loadTickets: getAllTicketsThunk,
  }
  , dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchableTable)
