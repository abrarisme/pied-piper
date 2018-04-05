import {ouroborosEndpoint} from "../../constants/services";
import {disableTickets, enableTickets, loadTickets} from "../actionCreators/allTickets";
import {getAllTicketsThunk} from "./tickets";

export const approveOfferProposalThunk = text => (dispatch) => {
  // TODO: Is this the correct method for approval etc?
  dispatch(disableTickets());
  return fetch(`${ouroborosEndpoint}/tickets/updateTicket`, { method: 'POST', body: text })
    .then((response) => {
      if (response.status === 200) {
        getAllTicketsThunk()
      } else {
        console.log(response.statusText);
      }
      dispatch(enableTickets());
    }).catch((err) => {
      console.log(err);
      dispatch(enableTickets());
    });
};