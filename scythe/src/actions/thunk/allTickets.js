import {ouroborosEndpoint} from "../../constants/services";
import {disableTickets, enableTickets, loadTickets} from "../actionCreators/allTickets";

export const approveOfferProposalThunk = text => (dispatch) => {
  // TODO: Is this the correct method for approval etc?
  dispatch(disableTickets());
  return fetch(`${ouroborosEndpoint}/tickets/updateTicket`, { method: 'POST', body: text })
    .then((response) => {
      if (response.status === 200) {
        loadTicketsThunk();
      } else {
        console.log(response.statusText);
      }
      dispatch(enableTickets());
    }).catch((err) => {
      console.log(err);
      dispatch(enableTickets());
    });
};



// Fetch all tickets from backend
export const loadTicketsThunk = () => (dispatch) => {
  return fetch(`${ouroborosEndpoint}/tickets/allTickets`, { method: 'GET' })
    .then((response) => {
      if(response.status === 200) {
        dispatch(loadTickets(response.body))
      } else {
        console.log(response.statusText)
      }
    }).catch((err) => {
      console.log(err);
    })
};